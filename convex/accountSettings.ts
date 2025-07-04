import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { canAccessDocument, getClerkUserId, requireAuth } from './lib/auth'

// Query to get current user's account settings
export const getAccountSettings = query({
  handler: async ctx => {
    const userId = await getClerkUserId(ctx)
    if (!userId) {
      return null
    }

    // RLS: Only return settings for the authenticated user
    const settings = await ctx.db
      .query('account_settings')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .first()

    return settings
  },
})

// Mutation to create account settings
export const createAccountSettings = mutation({
  args: {
    clerk_email: v.string(),
    notifications_email: v.string(),
    onboarding_completed: v.boolean(),
    weekly_reminder: v.boolean(),
    weekly_reminder_hour: v.number(),
    weekly_reminder_minute: v.number(),
    weekly_reminder_day: v.union(
      v.literal('monday'),
      v.literal('tuesday'),
      v.literal('wednesday'),
      v.literal('thursday'),
      v.literal('friday'),
      v.literal('saturday'),
      v.literal('sunday')
    ),
    weekly_reminder_time_zone: v.string(),
    perf_questions: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx)

    // Check if settings already exist for this user
    const existingSettings = await ctx.db
      .query('account_settings')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .first()

    if (existingSettings) {
      throw new Error('Account settings already exist for this user')
    }

    const now = Date.now()

    // RLS: Create settings with the authenticated user's ID
    const settingsId = await ctx.db.insert('account_settings', {
      user_id: userId,
      clerk_email: args.clerk_email,
      notifications_email: args.notifications_email,
      tokenIdentifier: userId, // Use userId as tokenIdentifier for RLS
      onboarding_completed: args.onboarding_completed,
      weekly_reminder: args.weekly_reminder,
      weekly_reminder_hour: args.weekly_reminder_hour,
      weekly_reminder_minute: args.weekly_reminder_minute,
      weekly_reminder_day: args.weekly_reminder_day,
      weekly_reminder_time_zone: args.weekly_reminder_time_zone,
      perf_questions: args.perf_questions,
      created_at: now,
      updated_at: now,
    })

    return settingsId
  },
})

// Mutation to update account settings
export const updateAccountSettings = mutation({
  args: {
    id: v.id('account_settings'),
    clerk_email: v.optional(v.string()),
    notifications_email: v.optional(v.string()),
    onboarding_completed: v.optional(v.boolean()),
    weekly_reminder: v.optional(v.boolean()),
    weekly_reminder_hour: v.optional(v.number()),
    weekly_reminder_minute: v.optional(v.number()),
    weekly_reminder_day: v.optional(
      v.union(
        v.literal('monday'),
        v.literal('tuesday'),
        v.literal('wednesday'),
        v.literal('thursday'),
        v.literal('friday'),
        v.literal('saturday'),
        v.literal('sunday')
      )
    ),
    weekly_reminder_time_zone: v.optional(v.string()),
    perf_questions: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    // Get the document to check ownership
    const settings = await ctx.db.get(args.id)
    if (!settings) {
      throw new Error('Account settings not found')
    }

    // RLS: Ensure user can only update their own settings
    if (!(await canAccessDocument(ctx, settings))) {
      throw new Error('Access denied: You can only update your own settings')
    }

    // Prepare update data with proper typing
    const updateData: {
      updated_at: number
      clerk_email?: string
      notifications_email?: string
      onboarding_completed?: boolean
      weekly_reminder?: boolean
      weekly_reminder_hour?: number
      weekly_reminder_minute?: number
      weekly_reminder_day?:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'
      weekly_reminder_time_zone?: string
      perf_questions?: Array<{
        title: string
        description: string
      }>
    } = {
      updated_at: Date.now(),
    }

    // Only include fields that are provided
    if (args.clerk_email !== undefined)
      updateData.clerk_email = args.clerk_email
    if (args.notifications_email !== undefined)
      updateData.notifications_email = args.notifications_email
    if (args.onboarding_completed !== undefined)
      updateData.onboarding_completed = args.onboarding_completed
    if (args.weekly_reminder !== undefined)
      updateData.weekly_reminder = args.weekly_reminder
    if (args.weekly_reminder_hour !== undefined)
      updateData.weekly_reminder_hour = args.weekly_reminder_hour
    if (args.weekly_reminder_minute !== undefined)
      updateData.weekly_reminder_minute = args.weekly_reminder_minute
    if (args.weekly_reminder_day !== undefined)
      updateData.weekly_reminder_day = args.weekly_reminder_day
    if (args.weekly_reminder_time_zone !== undefined)
      updateData.weekly_reminder_time_zone = args.weekly_reminder_time_zone
    if (args.perf_questions !== undefined)
      updateData.perf_questions = args.perf_questions

    // Update the document
    await ctx.db.patch(args.id, updateData)

    return args.id
  },
})

// Mutation to delete account settings
export const deleteAccountSettings = mutation({
  args: {
    id: v.id('account_settings'),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    // Get the document to check ownership
    const settings = await ctx.db.get(args.id)
    if (!settings) {
      throw new Error('Account settings not found')
    }

    // RLS: Ensure user can only delete their own settings
    if (!(await canAccessDocument(ctx, settings))) {
      throw new Error('Access denied: You can only delete your own settings')
    }

    await ctx.db.delete(args.id)
    return true
  },
})

// Query to check if user has completed onboarding
export const hasCompletedOnboarding = query({
  handler: async ctx => {
    const userId = await getClerkUserId(ctx)
    if (!userId) {
      return false
    }

    const settings = await ctx.db
      .query('account_settings')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .first()

    return settings?.onboarding_completed ?? false
  },
})

// Query to get user's reminder preferences
export const getReminderPreferences = query({
  handler: async ctx => {
    const userId = await getClerkUserId(ctx)
    if (!userId) {
      return null
    }

    const settings = await ctx.db
      .query('account_settings')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .first()

    if (!settings) {
      return null
    }

    return {
      weekly_reminder: settings.weekly_reminder,
      weekly_reminder_hour: settings.weekly_reminder_hour,
      weekly_reminder_minute: settings.weekly_reminder_minute,
      weekly_reminder_day: settings.weekly_reminder_day,
      weekly_reminder_time_zone: settings.weekly_reminder_time_zone,
    }
  },
})
