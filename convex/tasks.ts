import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const listTasks = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    if (args.status) {
      return await ctx.db
        .query('tasks')
        .withIndex('by_user_status', q =>
          q.eq('user_id', userId).eq('status', args.status!)
        )
        .order('desc')
        .collect()
    } else {
      return await ctx.db
        .query('tasks')
        .withIndex('by_user', q => q.eq('user_id', userId))
        .order('desc')
        .collect()
    }
  },
})

export const getTask = query({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new ConvexError('Task not found')
    }

    if (task.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    return task
  },
})

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    due_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject
    const now = Date.now()

    return await ctx.db.insert('tasks', {
      user_id: userId,
      title: args.title.trim(),
      description: args.description.trim(),
      due_date: args.due_date,
      status: args.status || 'pending',
      created_at: now,
      updated_at: now,
    })
  },
})

export const updateTask = mutation({
  args: {
    id: v.id('tasks'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    due_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
    completion_date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new ConvexError('Task not found')
    }

    if (task.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    const updateData: {
      updated_at: number
      title?: string
      description?: string
      due_date?: number
      status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      completion_date?: number
    } = {
      updated_at: Date.now(),
    }

    if (args.title !== undefined) {
      updateData.title = args.title.trim()
    }

    if (args.description !== undefined) {
      updateData.description = args.description.trim()
    }

    if (args.due_date !== undefined) {
      updateData.due_date = args.due_date
    }

    if (args.status !== undefined) {
      updateData.status = args.status

      // Auto-set completion_date when task is marked as completed
      if (args.status === 'completed' && !task.completion_date) {
        updateData.completion_date = Date.now()
      }

      // Clear completion_date if task is changed from completed to something else
      if (args.status !== 'completed' && task.completion_date) {
        updateData.completion_date = undefined
      }
    }

    if (args.completion_date !== undefined) {
      updateData.completion_date = args.completion_date
    }

    await ctx.db.patch(args.id, updateData)
  },
})

export const deleteTask = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new ConvexError('Task not found')
    }

    if (task.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    await ctx.db.delete(args.id)
  },
})

export const markTaskCompleted = mutation({
  args: {
    id: v.id('tasks'),
    completion_date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new ConvexError('Task not found')
    }

    if (task.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    await ctx.db.patch(args.id, {
      status: 'completed',
      completion_date: args.completion_date || Date.now(),
      updated_at: Date.now(),
    })
  },
})

export const getTasksByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    // Get tasks that are due within the date range or completed within the date range
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', q => q.eq('user_id', userId))
      .collect()

    return tasks.filter(task => {
      const dueInRange =
        task.due_date &&
        task.due_date >= args.startDate &&
        task.due_date <= args.endDate
      const completedInRange =
        task.completion_date &&
        task.completion_date >= args.startDate &&
        task.completion_date <= args.endDate
      return dueInRange || completedInRange
    })
  },
})
