import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const create = mutation({
  args: {
    user_id: v.string(),
    event: v.number(),
  },
  handler: async (ctx, args) => {
    const milestoneId = await ctx.db.insert('milestones', {
      user_id: args.user_id,
      event: args.event,
      created_at: Date.now(),
    })
    return milestoneId
  },
})

export const getByUser = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('milestones')
      .withIndex('by_user', q => q.eq('user_id', args.user_id))
      .order('desc')
      .collect()
  },
})

export const getByEvent = query({
  args: { event: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('milestones')
      .withIndex('by_event', q => q.eq('event', args.event))
      .order('desc')
      .collect()
  },
})
