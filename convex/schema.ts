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
})
