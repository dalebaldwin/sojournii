import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Helper function to get week start date for a given date (same as retros)
// Week starts on Monday to match frontend calculation
const getWeekStart = (date: Date, userTimezone?: string): string => {
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

  const startDate = new Date(workingDate)
  startDate.setDate(workingDate.getDate() - daysToSubtract)
  return startDate.toISOString().split('T')[0]
}

export const listResponses = query({
  args: {
    questionId: v.optional(v.id('performance_questions')),
    weekStartDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    if (args.questionId && args.weekStartDate) {
      // Get responses for a specific question and week
      return await ctx.db
        .query('performance_responses')
        .withIndex('by_user_question_week', q =>
          q
            .eq('user_id', userId)
            .eq('question_id', args.questionId!)
            .eq('week_start_date', args.weekStartDate!)
        )
        .order('desc')
        .collect()
    } else if (args.questionId) {
      // Get all responses for a specific question
      return await ctx.db
        .query('performance_responses')
        .withIndex('by_user_question', q =>
          q.eq('user_id', userId).eq('question_id', args.questionId!)
        )
        .order('desc')
        .collect()
    } else if (args.weekStartDate) {
      // Get all responses for a specific week
      return await ctx.db
        .query('performance_responses')
        .withIndex('by_user_week', q =>
          q.eq('user_id', userId).eq('week_start_date', args.weekStartDate!)
        )
        .order('desc')
        .collect()
    } else {
      // Get all responses for the user
      return await ctx.db
        .query('performance_responses')
        .withIndex('by_user', q => q.eq('user_id', userId))
        .order('desc')
        .collect()
    }
  },
})

export const getResponse = query({
  args: { id: v.id('performance_responses') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const response = await ctx.db.get(args.id)
    if (!response) {
      throw new ConvexError('Response not found')
    }

    if (response.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    return response
  },
})

export const getWeeklyResponses = query({
  args: {
    weekStartDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    // If no week provided, use current week
    const weekStartDate =
      args.weekStartDate || getWeekStart(new Date(), userTimezone)

    // Get all responses for this week
    const responses = await ctx.db
      .query('performance_responses')
      .withIndex('by_user_week', q =>
        q.eq('user_id', userId).eq('week_start_date', weekStartDate)
      )
      .collect()

    // Get all active questions to show which ones don't have responses yet
    const questions = await ctx.db
      .query('performance_questions')
      .withIndex('by_user_active', q =>
        q.eq('user_id', userId).eq('is_active', true)
      )
      .order('asc')
      .collect()

    return {
      weekStartDate,
      responses,
      questions,
    }
  },
})

export const createResponse = mutation({
  args: {
    questionId: v.id('performance_questions'),
    response: v.string(),
    response_html: v.optional(v.string()),
    response_json: v.optional(v.string()),
    weekStartDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject
    const now = Date.now()

    // Verify the question belongs to the user
    const question = await ctx.db.get(args.questionId)
    if (!question || question.user_id !== userId) {
      throw new ConvexError('Question not found or access denied')
    }

    // Get user's timezone from account settings
    const accountSettings = await ctx.db
      .query('account_settings')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .first()

    const userTimezone = accountSettings?.weekly_reminder_time_zone

    // Use provided week or current week
    const weekStartDate =
      args.weekStartDate || getWeekStart(new Date(), userTimezone)

    return await ctx.db.insert('performance_responses', {
      user_id: userId,
      question_id: args.questionId,
      week_start_date: weekStartDate,
      response: args.response.trim(),
      response_html: args.response_html,
      response_json: args.response_json,
      created_at: now,
      updated_at: now,
    })
  },
})

export const updateResponse = mutation({
  args: {
    id: v.id('performance_responses'),
    response: v.optional(v.string()),
    response_html: v.optional(v.string()),
    response_json: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const existingResponse = await ctx.db.get(args.id)
    if (!existingResponse) {
      throw new ConvexError('Response not found')
    }

    if (existingResponse.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    const updateData: {
      updated_at: number
      response?: string
      response_html?: string
      response_json?: string
    } = {
      updated_at: Date.now(),
    }

    if (args.response !== undefined) {
      updateData.response = args.response.trim()
    }
    if (args.response_html !== undefined) {
      updateData.response_html = args.response_html
    }
    if (args.response_json !== undefined) {
      updateData.response_json = args.response_json
    }

    await ctx.db.patch(args.id, updateData)
  },
})

export const deleteResponse = mutation({
  args: { id: v.id('performance_responses') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const response = await ctx.db.get(args.id)
    if (!response) {
      throw new ConvexError('Response not found')
    }

    if (response.user_id !== identity.subject) {
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
    const weekStartDate = getWeekStart(now, userTimezone)

    const endDate = new Date(weekStartDate)
    endDate.setDate(endDate.getDate() + 6)

    return {
      startDate: weekStartDate,
      endDate: endDate.toISOString().split('T')[0],
      currentDate: now.toISOString().split('T')[0],
    }
  },
})

export const getResponseHistory = query({
  args: {
    questionId: v.id('performance_questions'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    // Verify the question belongs to the user
    const question = await ctx.db.get(args.questionId)
    if (!question || question.user_id !== userId) {
      throw new ConvexError('Question not found or access denied')
    }

    const limit = args.limit || 10

    return await ctx.db
      .query('performance_responses')
      .withIndex('by_user_question', q =>
        q.eq('user_id', userId).eq('question_id', args.questionId)
      )
      .order('desc')
      .take(limit)
  },
})
