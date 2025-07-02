import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const tokenIdentifier = identity.tokenIdentifier

    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token', q => q.eq('tokenIdentifier', tokenIdentifier))
      .first()

    if (existingUser) {
      return existingUser._id
    }

    // Create new user
    const userId = await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      pictureUrl: args.pictureUrl,
      tokenIdentifier,
    })

    return userId
  },
})

export const getCurrentUser = query({
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const tokenIdentifier = identity.tokenIdentifier

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', q => q.eq('tokenIdentifier', tokenIdentifier))
      .first()

    return user
  },
})
