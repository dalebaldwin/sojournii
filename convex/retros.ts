import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Helper function to get week start and end dates for a given date in a specific timezone
// Week starts on Monday and ends on Sunday to match frontend calculation
const getWeekRange = (
  date: Date,
  userTimezone?: string
): { startDate: string; endDate: string } => {
  // If we have a user timezone, calculate the week based on that timezone
  let workingDate: Date
  if (userTimezone) {
    try {
      // Get the date in the user's timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: userTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      const parts = formatter.formatToParts(date)
      const year = parseInt(
        parts.find(part => part.type === 'year')?.value || '0'
      )
      const month = parseInt(
        parts.find(part => part.type === 'month')?.value || '1'
      )
      const day = parseInt(
        parts.find(part => part.type === 'day')?.value || '1'
      )
      workingDate = new Date(year, month - 1, day)
    } catch (error) {
      console.warn('Error converting date to user timezone:', error)
      workingDate = new Date(date)
    }
  } else {
    workingDate = new Date(date)
  }

  const dayOfWeek = workingDate.getDay()

  // Calculate how many days to subtract to get to Monday
  // If it's Sunday (0), we need to go back 6 days to get to Monday
  // If it's Monday (1), we need to go back 0 days
  // If it's Tuesday (2), we need to go back 1 day, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  // Get Monday of this week
  const startDate = new Date(workingDate)
  startDate.setDate(workingDate.getDate() - daysToSubtract)

  // Get Sunday of this week (6 days after Monday)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

export const listRetros = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    return await ctx.db
      .query('retros')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .order('desc')
      .collect()
  },
})

export const getRetro = query({
  args: { id: v.id('retros') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const retro = await ctx.db.get(args.id)
    if (!retro) {
      throw new ConvexError('Retro not found')
    }

    if (retro.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    return retro
  },
})

export const getCurrentWeekRetro = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    // Get user's timezone from account settings
    const accountSettings = await ctx.db
      .query('account_settings')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .first()

    const userTimezone = accountSettings?.weekly_reminder_time_zone
    const now = new Date()
    const { startDate } = getWeekRange(now, userTimezone)

    const retro = await ctx.db
      .query('retros')
      .withIndex('by_user_week', q =>
        q.eq('user_id', userId).eq('week_start_date', startDate)
      )
      .first()

    return retro
  },
})

export const getRetroByWeek = query({
  args: { weekStartDate: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    const retro = await ctx.db
      .query('retros')
      .withIndex('by_user_week', q =>
        q.eq('user_id', userId).eq('week_start_date', args.weekStartDate)
      )
      .first()

    return retro
  },
})

export const createRetro = mutation({
  args: {
    week_start_date: v.optional(v.string()),
    general_feelings: v.number(),
    work_relationships: v.number(),
    professional_growth: v.number(),
    productivity: v.number(),
    personal_wellbeing: v.number(),
    positive_outcomes: v.string(),
    positive_outcomes_html: v.optional(v.string()),
    positive_outcomes_json: v.optional(v.string()),
    negative_outcomes: v.string(),
    negative_outcomes_html: v.optional(v.string()),
    negative_outcomes_json: v.optional(v.string()),
    key_takeaways: v.string(),
    key_takeaways_html: v.optional(v.string()),
    key_takeaways_json: v.optional(v.string()),
    mark_as_completed: v.optional(v.boolean()), // New optional flag
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject
    const now = Date.now()

    // If no week_start_date provided, use current week
    const weekRange = args.week_start_date
      ? { startDate: args.week_start_date, endDate: '' } // We'll calculate end date
      : getWeekRange(new Date())

    // Calculate end date if not provided
    if (!weekRange.endDate) {
      const startDate = new Date(args.week_start_date!)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      weekRange.endDate = endDate.toISOString().split('T')[0]
    }

    // Check if retro already exists for this week
    const existingRetro = await ctx.db
      .query('retros')
      .withIndex('by_user_week', q =>
        q.eq('user_id', userId).eq('week_start_date', weekRange.startDate)
      )
      .first()

    if (existingRetro) {
      throw new ConvexError('Retro already exists for this week')
    }

    // Validate slider values are between 0 and 100
    const sliderValues = [
      args.general_feelings,
      args.work_relationships,
      args.professional_growth,
      args.productivity,
      args.personal_wellbeing,
    ]

    for (const value of sliderValues) {
      if (value < 0 || value > 100) {
        throw new ConvexError('Slider values must be between 0 and 100')
      }
    }

    const retroData = {
      user_id: userId,
      week_start_date: weekRange.startDate,
      week_end_date: weekRange.endDate,
      general_feelings: args.general_feelings,
      work_relationships: args.work_relationships,
      professional_growth: args.professional_growth,
      productivity: args.productivity,
      personal_wellbeing: args.personal_wellbeing,
      positive_outcomes: args.positive_outcomes.trim(),
      positive_outcomes_html: args.positive_outcomes_html,
      positive_outcomes_json: args.positive_outcomes_json,
      negative_outcomes: args.negative_outcomes.trim(),
      negative_outcomes_html: args.negative_outcomes_html,
      negative_outcomes_json: args.negative_outcomes_json,
      key_takeaways: args.key_takeaways.trim(),
      key_takeaways_html: args.key_takeaways_html,
      key_takeaways_json: args.key_takeaways_json,
      created_at: now,
      updated_at: now,
      // Only set completed_at if explicitly marking as completed
      ...(args.mark_as_completed ? { completed_at: now } : {}),
    }

    return await ctx.db.insert('retros', retroData)
  },
})

export const updateRetro = mutation({
  args: {
    id: v.id('retros'),
    general_feelings: v.optional(v.number()),
    work_relationships: v.optional(v.number()),
    professional_growth: v.optional(v.number()),
    productivity: v.optional(v.number()),
    personal_wellbeing: v.optional(v.number()),
    positive_outcomes: v.optional(v.string()),
    positive_outcomes_html: v.optional(v.string()),
    positive_outcomes_json: v.optional(v.string()),
    negative_outcomes: v.optional(v.string()),
    negative_outcomes_html: v.optional(v.string()),
    negative_outcomes_json: v.optional(v.string()),
    key_takeaways: v.optional(v.string()),
    key_takeaways_html: v.optional(v.string()),
    key_takeaways_json: v.optional(v.string()),
    mark_as_completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const retro = await ctx.db.get(args.id)
    if (!retro) {
      throw new ConvexError('Retro not found')
    }

    if (retro.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    const updateData: {
      updated_at: number
      completed_at?: number
      general_feelings?: number
      work_relationships?: number
      professional_growth?: number
      productivity?: number
      personal_wellbeing?: number
      positive_outcomes?: string
      positive_outcomes_html?: string
      positive_outcomes_json?: string
      negative_outcomes?: string
      negative_outcomes_html?: string
      negative_outcomes_json?: string
      key_takeaways?: string
      key_takeaways_html?: string
      key_takeaways_json?: string
    } = {
      updated_at: Date.now(),
    }

    // Validate and update slider values
    const sliderFields = [
      'general_feelings',
      'work_relationships',
      'professional_growth',
      'productivity',
      'personal_wellbeing',
    ] as const

    for (const field of sliderFields) {
      if (args[field] !== undefined) {
        if (args[field]! < 0 || args[field]! > 100) {
          throw new ConvexError('Slider values must be between 0 and 100')
        }
        updateData[field] = args[field]
      }
    }

    // Update text fields
    if (args.positive_outcomes !== undefined) {
      updateData.positive_outcomes = args.positive_outcomes.trim()
    }
    if (args.positive_outcomes_html !== undefined) {
      updateData.positive_outcomes_html = args.positive_outcomes_html
    }
    if (args.positive_outcomes_json !== undefined) {
      updateData.positive_outcomes_json = args.positive_outcomes_json
    }

    if (args.negative_outcomes !== undefined) {
      updateData.negative_outcomes = args.negative_outcomes.trim()
    }
    if (args.negative_outcomes_html !== undefined) {
      updateData.negative_outcomes_html = args.negative_outcomes_html
    }
    if (args.negative_outcomes_json !== undefined) {
      updateData.negative_outcomes_json = args.negative_outcomes_json
    }

    if (args.key_takeaways !== undefined) {
      updateData.key_takeaways = args.key_takeaways.trim()
    }
    if (args.key_takeaways_html !== undefined) {
      updateData.key_takeaways_html = args.key_takeaways_html
    }
    if (args.key_takeaways_json !== undefined) {
      updateData.key_takeaways_json = args.key_takeaways_json
    }

    // Mark as completed if requested, or if it wasn't completed before
    if (args.mark_as_completed || !retro.completed_at) {
      updateData.completed_at = Date.now()
    }

    await ctx.db.patch(args.id, updateData)
  },
})

export const deleteRetro = mutation({
  args: { id: v.id('retros') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const retro = await ctx.db.get(args.id)
    if (!retro) {
      throw new ConvexError('Retro not found')
    }

    if (retro.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    await ctx.db.delete(args.id)
  },
})

export const getCurrentWeekInfo = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    // Get user's timezone from account settings
    const accountSettings = await ctx.db
      .query('account_settings')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .first()

    const userTimezone = accountSettings?.weekly_reminder_time_zone
    const now = new Date()
    const weekRange = getWeekRange(now, userTimezone)

    return {
      startDate: weekRange.startDate,
      endDate: weekRange.endDate,
      currentDate: now.toISOString().split('T')[0],
    }
  },
})
