import { v } from 'convex/values'
import { TIMELINE_EVENT_TYPES } from '../src/lib/milestone-events'
import { getNextWeeklyReminderUtc } from '../src/lib/time-functions'
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
    scheduled_weekly_reminder_id: v.optional(v.string()),
    work_hours: v.optional(v.number()),
    work_minutes: v.optional(v.number()),
    work_start_hour: v.optional(v.number()),
    work_start_minute: v.optional(v.number()),
    work_start_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    work_end_hour: v.optional(v.number()),
    work_end_minute: v.optional(v.number()),
    work_end_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    default_work_from_home: v.optional(v.boolean()),
    break_hours: v.optional(v.number()),
    break_minutes: v.optional(v.number()),
    employers: v.optional(
      v.array(
        v.object({
          employer_name: v.string(),
          start_year: v.number(),
          start_month: v.number(),
          start_day: v.number(),
          end_year: v.optional(v.number()),
          end_month: v.optional(v.number()),
          end_day: v.optional(v.number()),
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

    let nextWeeklyReminderUtc: number | undefined = undefined
    if (args.weekly_reminder) {
      nextWeeklyReminderUtc = getNextWeeklyReminderUtc(
        args.weekly_reminder_day,
        args.weekly_reminder_hour,
        args.weekly_reminder_minute,
        args.weekly_reminder_time_zone
      )
    }

    // RLS: Create settings with the authenticated user's ID
    const accountSettingsId = await ctx.db.insert('account_settings', {
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
      next_weekly_reminder_utc: nextWeeklyReminderUtc,
      work_hours: args.work_hours,
      work_minutes: args.work_minutes,
      work_start_hour: args.work_start_hour,
      work_start_minute: args.work_start_minute,
      work_start_am_pm: args.work_start_am_pm,
      work_end_hour: args.work_end_hour,
      work_end_minute: args.work_end_minute,
      work_end_am_pm: args.work_end_am_pm,
      default_work_from_home: args.default_work_from_home,
      break_hours: args.break_hours,
      break_minutes: args.break_minutes,
      employers: args.employers,
      created_at: now,
      updated_at: now,
    })

    // Create timeline event for joining Sojournii
    await ctx.db.insert('timeline_events', {
      user_id: userId,
      event_type: 'joined_sojournii',
      title: 'Joined Sojournii',
      description: 'Welcome to your professional journey tracking!',
      created_at: now,
    })

    // Remove any calls to scheduleWeeklyReminder or related scheduling logic

    return accountSettingsId
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
    scheduled_weekly_reminder_id: v.optional(v.string()),
    email_notifications_disabled: v.optional(v.boolean()),
    work_hours: v.optional(v.number()),
    work_minutes: v.optional(v.number()),
    work_start_hour: v.optional(v.number()),
    work_start_minute: v.optional(v.number()),
    work_start_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    work_end_hour: v.optional(v.number()),
    work_end_minute: v.optional(v.number()),
    work_end_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    default_work_from_home: v.optional(v.boolean()),
    break_hours: v.optional(v.number()),
    break_minutes: v.optional(v.number()),
    employers: v.optional(
      v.array(
        v.object({
          employer_name: v.string(),
          start_year: v.number(),
          start_month: v.number(),
          start_day: v.number(),
          end_year: v.optional(v.number()),
          end_month: v.optional(v.number()),
          end_day: v.optional(v.number()),
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
      scheduled_weekly_reminder_id?: string
      email_notifications_disabled?: boolean
      next_weekly_reminder_utc?: number
      work_hours?: number
      work_minutes?: number
      work_start_hour?: number
      work_start_minute?: number
      work_start_am_pm?: 'AM' | 'PM'
      work_end_hour?: number
      work_end_minute?: number
      work_end_am_pm?: 'AM' | 'PM'
      default_work_from_home?: boolean
      break_hours?: number
      break_minutes?: number
      employers?: Array<{
        employer_name: string
        start_year: number
        start_month: number
        start_day: number
        end_year?: number
        end_month?: number
        end_day?: number
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
    if (args.scheduled_weekly_reminder_id !== undefined)
      updateData.scheduled_weekly_reminder_id =
        args.scheduled_weekly_reminder_id
    if (args.email_notifications_disabled !== undefined) {
      updateData.email_notifications_disabled =
        args.email_notifications_disabled
    }
    if (args.work_hours !== undefined) updateData.work_hours = args.work_hours
    if (args.work_minutes !== undefined)
      updateData.work_minutes = args.work_minutes
    if (args.work_start_hour !== undefined)
      updateData.work_start_hour = args.work_start_hour
    if (args.work_start_minute !== undefined)
      updateData.work_start_minute = args.work_start_minute
    if (args.work_start_am_pm !== undefined)
      updateData.work_start_am_pm = args.work_start_am_pm
    if (args.work_end_hour !== undefined)
      updateData.work_end_hour = args.work_end_hour
    if (args.work_end_minute !== undefined)
      updateData.work_end_minute = args.work_end_minute
    if (args.work_end_am_pm !== undefined)
      updateData.work_end_am_pm = args.work_end_am_pm
    if (args.default_work_from_home !== undefined)
      updateData.default_work_from_home = args.default_work_from_home
    if (args.break_hours !== undefined)
      updateData.break_hours = args.break_hours
    if (args.break_minutes !== undefined)
      updateData.break_minutes = args.break_minutes
    if (args.employers !== undefined) updateData.employers = args.employers

    // Recalculate next_weekly_reminder_utc if any relevant fields are updated
    const shouldRecalculate =
      args.weekly_reminder_day !== undefined ||
      args.weekly_reminder_hour !== undefined ||
      args.weekly_reminder_minute !== undefined ||
      args.weekly_reminder_time_zone !== undefined
    if (shouldRecalculate) {
      const day = args.weekly_reminder_day ?? settings.weekly_reminder_day
      const hour = args.weekly_reminder_hour ?? settings.weekly_reminder_hour
      const minute =
        args.weekly_reminder_minute ?? settings.weekly_reminder_minute
      const tz =
        args.weekly_reminder_time_zone ?? settings.weekly_reminder_time_zone
      updateData.next_weekly_reminder_utc = getNextWeeklyReminderUtc(
        day,
        hour,
        minute,
        tz
      )
    }

    await ctx.db.patch(args.id, updateData)

    // If onboarding_completed is set to true and was previously false, create a milestone
    if (
      args.onboarding_completed === true &&
      settings.onboarding_completed !== true
    ) {
      await ctx.db.insert('timeline_events', {
        user_id: settings.user_id,
        event_type: TIMELINE_EVENT_TYPES.JOINED_SOJOURNII,
        title: 'Joined Sojournii',
        description: 'Welcome to Sojournii! Your journey begins here.',
        created_at: Date.now(),
      })
    }
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
