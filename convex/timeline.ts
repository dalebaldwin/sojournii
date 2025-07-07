import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Create a timeline event
export const createTimelineEvent = mutation({
  args: {
    event_type: v.union(
      v.literal('joined_sojournii'),
      v.literal('new_employer'),
      v.literal('goal_created'),
      v.literal('goal_status_changed'),
      v.literal('goal_updated'),
      v.literal('goal_deleted'),
      v.literal('goal_milestone_created'),
      v.literal('goal_milestone_status_changed'),
      v.literal('goal_milestone_updated'),
      v.literal('goal_milestone_deleted'),
      v.literal('user_goal_update')
    ),
    content_id: v.optional(v.string()),
    content_type: v.optional(
      v.union(v.literal('goal'), v.literal('milestone'), v.literal('user'))
    ),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    previous_value: v.optional(v.string()),
    new_value: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const now = Date.now()
    return await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: args.event_type,
      content_id: args.content_id,
      content_type: args.content_type,
      title: args.title,
      description: args.description,
      previous_value: args.previous_value,
      new_value: args.new_value,
      created_at: now,
    })
  },
})

// Get timeline events for a user
export const getUserTimelineEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const limit = args.limit || 50

    return await ctx.db
      .query('timeline_events')
      .withIndex('by_user_created', q => q.eq('user_id', identity.subject))
      .order('desc')
      .take(limit)
  },
})

// Get timeline events for a specific goal
export const getGoalTimelineEvents = query({
  args: {
    goalId: v.id('goals'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Verify user owns the goal
    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.user_id !== identity.subject) {
      throw new Error('Goal not found or unauthorized')
    }

    const limit = args.limit || 50

    // Get timeline events for the goal
    const goalEvents = await ctx.db
      .query('timeline_events')
      .withIndex('by_content', q => q.eq('content_id', args.goalId))
      .order('desc')
      .collect()

    // Get all milestones for this goal to find their events
    const milestones = await ctx.db
      .query('goal_milestones')
      .withIndex('by_goal', q => q.eq('goal_id', args.goalId))
      .collect()

    // Get timeline events for all milestones
    const milestoneEvents = []
    for (const milestone of milestones) {
      const events = await ctx.db
        .query('timeline_events')
        .withIndex('by_content', q => q.eq('content_id', milestone._id))
        .collect()
      milestoneEvents.push(...events)
    }

    // Combine and sort all events by creation date
    const allEvents = [...goalEvents, ...milestoneEvents].sort(
      (a, b) => b.created_at - a.created_at
    )

    return allEvents.slice(0, limit)
  },
})

// Helper function to create goal-related timeline events
export const createGoalTimelineEvent = mutation({
  args: {
    event_type: v.union(
      v.literal('goal_created'),
      v.literal('goal_status_changed'),
      v.literal('goal_updated'),
      v.literal('goal_deleted')
    ),
    goal_id: v.id('goals'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    previous_value: v.optional(v.string()),
    new_value: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Verify user owns the goal
    const goal = await ctx.db.get(args.goal_id)
    if (!goal || goal.user_id !== identity.subject) {
      throw new Error('Goal not found or unauthorized')
    }

    const now = Date.now()
    return await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: args.event_type,
      content_id: args.goal_id,
      content_type: 'goal',
      title: args.title,
      description: args.description,
      previous_value: args.previous_value,
      new_value: args.new_value,
      created_at: now,
    })
  },
})

// Create a user goal update (progress note)
export const createUserGoalUpdate = mutation({
  args: {
    goal_id: v.id('goals'),
    title: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Verify user owns the goal
    const goal = await ctx.db.get(args.goal_id)
    if (!goal || goal.user_id !== identity.subject) {
      throw new Error('Goal not found or unauthorized')
    }

    const now = Date.now()
    return await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: 'user_goal_update',
      content_id: args.goal_id,
      content_type: 'goal',
      title: args.title,
      description: args.description,
      created_at: now,
    })
  },
})
