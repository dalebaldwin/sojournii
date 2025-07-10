import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const listQuestions = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    if (args.includeInactive) {
      return await ctx.db
        .query('performance_questions')
        .withIndex('by_user', q => q.eq('user_id', userId))
        .order('asc')
        .collect()
    } else {
      return await ctx.db
        .query('performance_questions')
        .withIndex('by_user_active', q =>
          q.eq('user_id', userId).eq('is_active', true)
        )
        .order('asc')
        .collect()
    }
  },
})

export const getQuestion = query({
  args: { id: v.id('performance_questions') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const question = await ctx.db.get(args.id)
    if (!question) {
      throw new ConvexError('Question not found')
    }

    if (question.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    return question
  },
})

export const createQuestion = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject
    const now = Date.now()

    // If no order specified, get the next order number
    let order = args.order
    if (order === undefined) {
      const existingQuestions = await ctx.db
        .query('performance_questions')
        .withIndex('by_user', q => q.eq('user_id', userId))
        .collect()

      order =
        existingQuestions.length > 0
          ? Math.max(...existingQuestions.map(q => q.order)) + 1
          : 1
    }

    return await ctx.db.insert('performance_questions', {
      user_id: userId,
      title: args.title.trim(),
      description: args.description.trim(),
      description_html: args.description_html,
      description_json: args.description_json,
      order,
      is_active: true,
      created_at: now,
      updated_at: now,
    })
  },
})

export const updateQuestion = mutation({
  args: {
    id: v.id('performance_questions'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    description_html: v.optional(v.string()),
    description_json: v.optional(v.string()),
    order: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const question = await ctx.db.get(args.id)
    if (!question) {
      throw new ConvexError('Question not found')
    }

    if (question.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    const updateData: {
      updated_at: number
      title?: string
      description?: string
      description_html?: string
      description_json?: string
      order?: number
      is_active?: boolean
    } = {
      updated_at: Date.now(),
    }

    if (args.title !== undefined) {
      updateData.title = args.title.trim()
    }
    if (args.description !== undefined) {
      updateData.description = args.description.trim()
    }
    if (args.description_html !== undefined) {
      updateData.description_html = args.description_html
    }
    if (args.description_json !== undefined) {
      updateData.description_json = args.description_json
    }
    if (args.order !== undefined) {
      updateData.order = args.order
    }
    if (args.is_active !== undefined) {
      updateData.is_active = args.is_active
    }

    await ctx.db.patch(args.id, updateData)
  },
})

export const deleteQuestion = mutation({
  args: { id: v.id('performance_questions') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const question = await ctx.db.get(args.id)
    if (!question) {
      throw new ConvexError('Question not found')
    }

    if (question.user_id !== identity.subject) {
      throw new ConvexError('Access denied')
    }

    // Check if there are any responses to this question
    const responses = await ctx.db
      .query('performance_responses')
      .withIndex('by_question', q => q.eq('question_id', args.id))
      .collect()

    if (responses.length > 0) {
      // Soft delete: disable the question instead of deleting it
      await ctx.db.patch(args.id, {
        is_active: false,
        updated_at: Date.now(),
      })
      return { type: 'soft_delete' as const, responseCount: responses.length }
    } else {
      // Hard delete: no responses exist, safe to completely remove
      await ctx.db.delete(args.id)
      return { type: 'hard_delete' as const, responseCount: 0 }
    }
  },
})

export const getDisabledQuestions = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    return await ctx.db
      .query('performance_questions')
      .withIndex('by_user_active', q =>
        q.eq('user_id', userId).eq('is_active', false)
      )
      .order('desc') // Most recently disabled first
      .collect()
  },
})

export const reorderQuestions = mutation({
  args: {
    questionIds: v.array(v.id('performance_questions')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const userId = identity.subject

    // Verify all questions belong to the user
    for (const questionId of args.questionIds) {
      const question = await ctx.db.get(questionId)
      if (!question || question.user_id !== userId) {
        throw new ConvexError('Invalid question ID or access denied')
      }
    }

    // Update orders
    for (let i = 0; i < args.questionIds.length; i++) {
      await ctx.db.patch(args.questionIds[i], {
        order: i + 1,
        updated_at: Date.now(),
      })
    }
  },
})
