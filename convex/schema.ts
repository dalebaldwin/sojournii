import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  account_settings: defineTable({
    user_id: v.string(),
    clerk_email: v.string(),
    notifications_email: v.string(),
    tokenIdentifier: v.string(),
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
    work_hours: v.optional(v.number()),
    work_minutes: v.optional(v.number()),
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
    created_at: v.number(),
    updated_at: v.number(),
    perf_questions: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
        })
      )
    ),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_user', ['user_id'])
    .index('clerk_email', ['clerk_email']),

  milestones: defineTable({
    user_id: v.string(),
    event: v.number(),
    created_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_event', ['event']),
})
