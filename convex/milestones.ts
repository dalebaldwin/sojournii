import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get milestones for a specific goal
export const getGoalMilestones = query({
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

    return await ctx.db
      .query('goal_milestones')
      .withIndex('by_goal_order', q => q.eq('goal_id', args.goalId))
      .order('asc')
      .collect()
  },
})

// Get all milestones for a user (for dashboard stats)
export const getUserMilestones = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('goal_milestones')
      .withIndex('by_user', q => q.eq('user_id', identity.subject))
      .order('desc')
      .collect()
  },
})

// Create a milestone
export const createMilestone = mutation({
  args: {
    goalId: v.id('goals'),
    name: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    target_date: v.optional(v.number()),
    order: v.number(),
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

    const now = Date.now()

    // Create the milestone record
    const milestoneId = await ctx.db.insert('goal_milestones', {
      goal_id: args.goalId,
      user_id: identity.subject,
      name: args.name,
      description: args.description,
      description_html: args.description_html,
      description_json: args.description_json,
      target_date: args.target_date,
      status: 'pending',
      order: args.order,
      created_at: now,
      updated_at: now,
    })

    // Create timeline event for milestone creation
    await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: 'goal_milestone_created',
      content_id: milestoneId,
      content_type: 'milestone',
      title: `Created milestone: ${args.name}`,
      description: `Added new milestone "${args.name}" to goal "${goal.name}"`,
      created_at: now,
    })

    return milestoneId
  },
})

// Update a milestone
export const updateMilestone = mutation({
  args: {
    milestoneId: v.id('goal_milestones'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    target_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get the milestone
    const milestone = await ctx.db.get(args.milestoneId)
    if (!milestone || milestone.user_id !== identity.subject) {
      throw new Error('Milestone not found or unauthorized')
    }

    // Get the goal for timeline event
    const goal = await ctx.db.get(milestone.goal_id)
    if (!goal) {
      throw new Error('Goal not found')
    }

    const now = Date.now()

    // Build update object
    const updates: Partial<{
      name: string
      description: string
      description_html: string
      description_json: string
      target_date: number
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      order: number
      updated_at: number
    }> = { updated_at: now }
    const changes: string[] = []

    if (args.name !== undefined) {
      updates.name = args.name
      if (args.name !== milestone.name) {
        changes.push(`Name: "${milestone.name}" → "${args.name}"`)
      }
    }
    if (args.description !== undefined) {
      updates.description = args.description
      if (args.description !== milestone.description) {
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
      if (args.target_date !== milestone.target_date) {
        changes.push('Target date updated')
      }
    }
    if (args.status !== undefined) {
      updates.status = args.status
      if (args.status !== milestone.status) {
        changes.push(`Status: ${milestone.status} → ${args.status}`)
      }
    }
    if (args.order !== undefined) {
      updates.order = args.order
      if (args.order !== milestone.order) {
        changes.push(`Order: ${milestone.order} → ${args.order}`)
      }
    }

    // Update the milestone
    await ctx.db.patch(args.milestoneId, updates)

    // Create timeline events
    if (args.status !== undefined && args.status !== milestone.status) {
      // Separate event for status changes
      await ctx.db.insert('timeline_events', {
        user_id: identity.subject,
        event_type: 'goal_milestone_status_changed',
        content_id: args.milestoneId,
        content_type: 'milestone',
        title: `Milestone status changed: ${milestone.status} → ${args.status}`,
        description: `Status of "${updates.name || milestone.name}" changed from ${milestone.status} to ${args.status}`,
        previous_value: milestone.status,
        new_value: args.status,
        created_at: now,
      })
    }

    // General update event (if there were changes other than just status)
    if (changes.length > 0 && !changes.every(c => c.startsWith('Status:'))) {
      await ctx.db.insert('timeline_events', {
        user_id: identity.subject,
        event_type: 'goal_milestone_updated',
        content_id: args.milestoneId,
        content_type: 'milestone',
        title: `Updated milestone: ${updates.name || milestone.name}`,
        description: `Updated milestone "${updates.name || milestone.name}" in goal "${goal.name}"`,
        created_at: now,
      })
    }
  },
})

// Delete a milestone
export const deleteMilestone = mutation({
  args: { milestoneId: v.id('goal_milestones') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get the milestone
    const milestone = await ctx.db.get(args.milestoneId)
    if (!milestone || milestone.user_id !== identity.subject) {
      throw new Error('Milestone not found or unauthorized')
    }

    // Get the goal for timeline event
    const goal = await ctx.db.get(milestone.goal_id)
    if (!goal) {
      throw new Error('Goal not found')
    }

    const now = Date.now()

    // Create timeline event for milestone deletion
    await ctx.db.insert('timeline_events', {
      user_id: identity.subject,
      event_type: 'goal_milestone_deleted',
      content_id: args.milestoneId,
      content_type: 'milestone',
      title: `Deleted milestone: ${milestone.name}`,
      description: `Removed milestone "${milestone.name}" from goal "${goal.name}"`,
      created_at: now,
    })

    // Delete the milestone
    await ctx.db.delete(args.milestoneId)
  },
})
