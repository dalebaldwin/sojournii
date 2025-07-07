import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all goals for a user
export const getGoals = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('goals')
      .withIndex('by_user', q => q.eq('user_id', identity.subject))
      .order('desc')
      .collect()
  },
})

// Get a single goal
export const getGoal = query({
  args: { goalId: v.id('goals') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.user_id !== identity.subject) {
      throw new Error('Goal not found or unauthorized')
    }

    return goal
  },
})

// Create a new goal
export const createGoal = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    target_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('completed'),
        v.literal('paused'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const now = Date.now()
    const goalId = await ctx.db.insert('goals', {
      user_id: identity.subject,
      name: args.name,
      description: args.description,
      description_html: args.description_html,
      description_json: args.description_json,
      target_date: args.target_date,
      status: args.status || 'active',
      created_at: now,
      updated_at: now,
    })

    // Create timeline event for goal creation
    await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: 'goal_created',
      content_id: goalId,
      content_type: 'goal',
      title: `Created goal: ${args.name}`,
      description: `New goal "${args.name}" was created`,
      created_at: now,
    })

    return goalId
  },
})

// Update a goal
export const updateGoal = mutation({
  args: {
    goalId: v.id('goals'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    target_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('completed'),
        v.literal('paused'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.user_id !== identity.subject) {
      throw new Error('Goal not found or unauthorized')
    }

    const now = Date.now()
    const changes: string[] = []

    // Build update object
    const updates: Partial<{
      name: string
      description: string
      description_html: string
      description_json: string
      target_date: number
      status: 'active' | 'completed' | 'paused' | 'cancelled'
      updated_at: number
    }> = { updated_at: now }

    if (args.name !== undefined) {
      updates.name = args.name
      if (args.name !== goal.name) {
        changes.push(`Name: "${goal.name}" → "${args.name}"`)
      }
    }
    if (args.description !== undefined) {
      updates.description = args.description
      if (args.description !== goal.description) {
        changes.push('Description updated')
      }
    }
    if (args.description_html !== undefined) {
      updates.description_html = args.description_html
    }
    if (args.description_json !== undefined) {
      updates.description_json = args.description_json
    }
    if (args.target_date !== undefined) {
      updates.target_date = args.target_date
      if (args.target_date !== goal.target_date) {
        changes.push('Target date updated')
      }
    }
    if (args.status !== undefined) {
      updates.status = args.status
      if (args.status !== goal.status) {
        changes.push(`Status: ${goal.status} → ${args.status}`)
      }
    }

    await ctx.db.patch(args.goalId, updates)

    // Create timeline events
    if (args.status !== undefined && args.status !== goal.status) {
      // Separate event for status changes
      await ctx.db.insert('timeline_events', {
        user_id: identity.subject,
        event_type: 'goal_status_changed',
        content_id: args.goalId,
        content_type: 'goal',
        title: `Goal status changed: ${goal.status} → ${args.status}`,
        description: `Status of "${updates.name || goal.name}" changed from ${goal.status} to ${args.status}`,
        previous_value: goal.status,
        new_value: args.status,
        created_at: now,
      })
    }

    // General update event (if there were changes other than just status)
    if (changes.length > 0 && !changes.every(c => c.startsWith('Status:'))) {
      await ctx.db.insert('timeline_events', {
        user_id: identity.subject,
        event_type: 'goal_updated',
        content_id: args.goalId,
        content_type: 'goal',
        title: `Updated goal: ${updates.name || goal.name}`,
        description: `Updated goal "${updates.name || goal.name}"`,
        created_at: now,
      })
    }

    return args.goalId
  },
})

// Delete a goal
export const deleteGoal = mutation({
  args: { goalId: v.id('goals') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.user_id !== identity.subject) {
      throw new Error('Goal not found or unauthorized')
    }

    const now = Date.now()

    // Create timeline event for goal deletion
    await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: 'goal_deleted',
      content_id: args.goalId,
      content_type: 'goal',
      title: `Deleted goal: ${goal.name}`,
      description: `Goal "${goal.name}" was deleted`,
      created_at: now,
    })

    // Get all milestones for this goal
    const milestones = await ctx.db
      .query('goal_milestones')
      .withIndex('by_goal', q => q.eq('goal_id', args.goalId))
      .collect()

    // Delete all milestones for this goal
    for (const milestone of milestones) {
      await ctx.db.delete(milestone._id)
    }

    // Delete the goal
    await ctx.db.delete(args.goalId)
  },
})

// Get timeline events for a goal
export const getGoalTimeline = query({
  args: { goalId: v.id('goals') },
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

    // Get all timeline events related to this goal and its milestones
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

    return allEvents.slice(0, 50) // Limit to 50 most recent events
  },
})

// Create goal with milestones (for the guided flow)
export const createGoalWithMilestones = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    target_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('completed'),
        v.literal('paused'),
        v.literal('cancelled')
      )
    ),
    milestones: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        description_html: v.optional(v.string()),
        description_json: v.optional(v.string()),
        target_date: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const now = Date.now()

    // Create the goal
    const goalId = await ctx.db.insert('goals', {
      user_id: identity.subject,
      name: args.name,
      description: args.description,
      description_html: args.description_html,
      description_json: args.description_json,
      target_date: args.target_date,
      status: args.status || 'active',
      created_at: now,
      updated_at: now,
    })

    // Create timeline event for goal creation
    await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: 'goal_created',
      content_id: goalId,
      content_type: 'goal',
      title: `Created goal: ${args.name}`,
      description: `New goal "${args.name}" was created with ${args.milestones.length} milestones`,
      created_at: now,
    })

    // Create milestones using the goal_milestones table
    for (let i = 0; i < args.milestones.length; i++) {
      const milestone = args.milestones[i]

      // Create the milestone record (no timeline event for initial milestones)
      await ctx.db.insert('goal_milestones', {
        goal_id: goalId,
        user_id: identity.subject,
        name: milestone.name,
        description: milestone.description,
        description_html: milestone.description_html,
        description_json: milestone.description_json,
        target_date: milestone.target_date,
        status: 'pending',
        order: i,
        created_at: now,
        updated_at: now,
      })
    }

    return goalId
  },
})
