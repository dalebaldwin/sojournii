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
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_user', ['user_id'])
    .index('clerk_email', ['clerk_email']),

  goals: defineTable({
    user_id: v.string(),
    name: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    target_date: v.optional(v.number()), // Unix timestamp
    status: v.union(
      v.literal('active'),
      v.literal('completed'),
      v.literal('paused'),
      v.literal('cancelled')
    ),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_status', ['status'])
    .index('by_user_status', ['user_id', 'status']),

  goal_milestones: defineTable({
    goal_id: v.id('goals'),
    user_id: v.string(),
    name: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    target_date: v.optional(v.number()), // Unix timestamp
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_goal', ['goal_id'])
    .index('by_user', ['user_id'])
    .index('by_goal_order', ['goal_id', 'order'])
    .index('by_status', ['status'])
    .index('by_user_status', ['user_id', 'status']),

  work_hour_entries: defineTable({
    user_id: v.string(),
    date: v.string(), // YYYY-MM-DD format
    work_hours: v.number(),
    work_minutes: v.number(),
    work_start_hour: v.optional(v.number()),
    work_start_minute: v.optional(v.number()),
    work_start_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    work_end_hour: v.optional(v.number()),
    work_end_minute: v.optional(v.number()),
    work_end_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    // Hybrid work support - separate home and office times
    work_home_start_hour: v.optional(v.number()),
    work_home_start_minute: v.optional(v.number()),
    work_home_start_am_pm: v.optional(
      v.union(v.literal('AM'), v.literal('PM'))
    ),
    work_home_end_hour: v.optional(v.number()),
    work_home_end_minute: v.optional(v.number()),
    work_home_end_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    work_office_start_hour: v.optional(v.number()),
    work_office_start_minute: v.optional(v.number()),
    work_office_start_am_pm: v.optional(
      v.union(v.literal('AM'), v.literal('PM'))
    ),
    work_office_end_hour: v.optional(v.number()),
    work_office_end_minute: v.optional(v.number()),
    work_office_end_am_pm: v.optional(
      v.union(v.literal('AM'), v.literal('PM'))
    ),
    work_location: v.optional(
      v.union(v.literal('home'), v.literal('office'), v.literal('hybrid'))
    ),
    // Keep work_from_home for backward compatibility
    work_from_home: v.optional(v.boolean()),
    break_hours: v.optional(v.number()),
    break_minutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_date', ['date'])
    .index('by_user_date', ['user_id', 'date']),

  timeline_events: defineTable({
    user_id: v.string(),
    event_type: v.union(
      // User milestones
      v.literal('joined_sojournii'),
      v.literal('new_employer'),
      // Goal events
      v.literal('goal_created'),
      v.literal('goal_status_changed'),
      v.literal('goal_updated'),
      v.literal('goal_deleted'),
      // Goal milestone events
      v.literal('goal_milestone_created'),
      v.literal('goal_milestone_status_changed'),
      v.literal('goal_milestone_updated'),
      v.literal('goal_milestone_deleted'),
      // User update events
      v.literal('user_goal_update')
    ),
    // Content reference system
    content_id: v.optional(v.string()), // ID of the related content (goal, milestone, etc.)
    content_type: v.optional(
      v.union(v.literal('goal'), v.literal('milestone'), v.literal('user'))
    ),
    // Event metadata (brief descriptions for timeline display)
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    // Previous and new values for change events
    previous_value: v.optional(v.string()),
    new_value: v.optional(v.string()),
    created_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_event_type', ['event_type'])
    .index('by_content', ['content_id'])
    .index('by_content_type', ['content_type'])
    .index('by_user_created', ['user_id', 'created_at']),

  notes: defineTable({
    user_id: v.string(),
    title: v.string(),
    content: v.string(),
    content_html: v.optional(v.string()),
    content_json: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_user_created', ['user_id', 'created_at'])
    .index('by_user_updated', ['user_id', 'updated_at']),

  tasks: defineTable({
    user_id: v.string(),
    title: v.string(),
    description: v.string(),
    due_date: v.optional(v.number()), // Unix timestamp
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    completion_date: v.optional(v.number()), // Unix timestamp when task was completed
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_status', ['status'])
    .index('by_user_status', ['user_id', 'status'])
    .index('by_due_date', ['due_date'])
    .index('by_user_due_date', ['user_id', 'due_date'])
    .index('by_completion_date', ['completion_date']),

  retros: defineTable({
    user_id: v.string(),
    week_start_date: v.string(), // YYYY-MM-DD format for the start of the week
    week_end_date: v.string(), // YYYY-MM-DD format for the end of the week
    // Slider values (0-100)
    general_feelings: v.number(),
    work_relationships: v.number(),
    professional_growth: v.number(),
    productivity: v.number(),
    personal_wellbeing: v.number(),
    // Text content using TipTap
    positive_outcomes: v.string(),
    positive_outcomes_html: v.optional(v.string()),
    positive_outcomes_json: v.optional(v.string()),
    negative_outcomes: v.string(),
    negative_outcomes_html: v.optional(v.string()),
    negative_outcomes_json: v.optional(v.string()),
    key_takeaways: v.string(),
    key_takeaways_html: v.optional(v.string()),
    key_takeaways_json: v.optional(v.string()),
    completed_at: v.optional(v.number()), // Unix timestamp when retro was completed
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_user_week', ['user_id', 'week_start_date'])
    .index('by_week_start', ['week_start_date'])
    .index('by_completed', ['completed_at']),

  performance_questions: defineTable({
    user_id: v.string(),
    title: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    order: v.number(), // Display order
    is_active: v.boolean(), // Allow users to disable questions
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_user_order', ['user_id', 'order'])
    .index('by_user_active', ['user_id', 'is_active']),

  performance_responses: defineTable({
    user_id: v.string(),
    question_id: v.id('performance_questions'),
    week_start_date: v.string(), // YYYY-MM-DD format for the start of the week
    response: v.string(), // Plain text response/note
    response_html: v.optional(v.string()),
    response_json: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_user', ['user_id'])
    .index('by_question', ['question_id'])
    .index('by_user_week', ['user_id', 'week_start_date'])
    .index('by_question_week', ['question_id', 'week_start_date'])
    .index('by_user_question', ['user_id', 'question_id'])
    .index('by_user_question_week', [
      'user_id',
      'question_id',
      'week_start_date',
    ]),
})
