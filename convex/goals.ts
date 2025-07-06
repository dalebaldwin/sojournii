import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all goals for a user
export const getUserGoals = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('goals')
      .withIndex('by_user', q => q.eq('user_id', identity.subject))
      .collect()
  },
})

// Get a specific goal by ID
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const now = Date.now()
    return await ctx.db.insert('goals', {
      user_id: identity.subject,
      name: args.name,
      description: args.description,
      description_html: args.description_html,
      description_json: args.description_json,
      target_date: args.target_date,
      status: 'active',
      created_at: now,
      updated_at: now,
    })
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

    const updates: Partial<{
      name: string
      description: string
      description_html?: string
      description_json?: string
      target_date?: number
      status: 'active' | 'completed' | 'paused' | 'cancelled'
      updated_at: number
    }> = { updated_at: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.description_html !== undefined)
      updates.description_html = args.description_html
    if (args.description_json !== undefined)
      updates.description_json = args.description_json
    if (args.target_date !== undefined) updates.target_date = args.target_date
    if (args.status !== undefined) updates.status = args.status

    await ctx.db.patch(args.goalId, updates)
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

    // Also delete all milestones for this goal
    const milestones = await ctx.db
      .query('goal_milestones')
      .withIndex('by_goal', q => q.eq('goal_id', args.goalId))
      .collect()

    for (const milestone of milestones) {
      await ctx.db.delete(milestone._id)
    }

    await ctx.db.delete(args.goalId)
  },
})

// Get milestones for a goal
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
    return await ctx.db.insert('goal_milestones', {
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

    const milestone = await ctx.db.get(args.milestoneId)
    if (!milestone || milestone.user_id !== identity.subject) {
      throw new Error('Milestone not found or unauthorized')
    }

    const updates: Partial<{
      name: string
      description: string
      description_html?: string
      description_json?: string
      target_date?: number
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      order: number
      updated_at: number
    }> = { updated_at: Date.now() }

    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.description_html !== undefined)
      updates.description_html = args.description_html
    if (args.description_json !== undefined)
      updates.description_json = args.description_json
    if (args.target_date !== undefined) updates.target_date = args.target_date
    if (args.status !== undefined) updates.status = args.status
    if (args.order !== undefined) updates.order = args.order

    await ctx.db.patch(args.milestoneId, updates)
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

    const milestone = await ctx.db.get(args.milestoneId)
    if (!milestone || milestone.user_id !== identity.subject) {
      throw new Error('Milestone not found or unauthorized')
    }

    await ctx.db.delete(args.milestoneId)
  },
})

// Create goal with milestones (for the guided flow)
export const createGoalWithMilestones = mutation({
  args: {
    goal: v.object({
      name: v.string(),
      description: v.string(),
      description_html: v.optional(v.string()),
      description_json: v.optional(v.string()),
      target_date: v.optional(v.number()),
    }),
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

    // Create the goal first
    const goalId = await ctx.db.insert('goals', {
      user_id: identity.subject,
      name: args.goal.name,
      description: args.goal.description,
      description_html: args.goal.description_html,
      description_json: args.goal.description_json,
      target_date: args.goal.target_date,
      status: 'active',
      created_at: now,
      updated_at: now,
    })

    // Create milestones
    for (let i = 0; i < args.milestones.length; i++) {
      const milestone = args.milestones[i]
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
