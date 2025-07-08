import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

// List all notes for a user, sorted by created_at descending (newest first)
export const listNotes = query({
  args: {
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_user_created', q => q.eq('user_id', args.user_id))
      .order('desc')
      .collect()

    return notes
  },
})

// Get a specific note by ID
export const getNote = query({
  args: {
    noteId: v.id('notes'),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)

    if (!note) {
      throw new ConvexError('Note not found')
    }

    // Ensure the note belongs to the requesting user
    if (note.user_id !== args.user_id) {
      throw new ConvexError('Unauthorized: Note does not belong to user')
    }

    return note
  },
})

// Create a new note
export const createNote = mutation({
  args: {
    user_id: v.string(),
    title: v.string(),
    content: v.string(),
    content_html: v.optional(v.string()),
    content_json: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const noteId = await ctx.db.insert('notes', {
      user_id: args.user_id,
      title: args.title,
      content: args.content,
      content_html: args.content_html,
      content_json: args.content_json,
      created_at: now,
      updated_at: now,
    })

    return noteId
  },
})

// Update an existing note
export const updateNote = mutation({
  args: {
    noteId: v.id('notes'),
    user_id: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    content_html: v.optional(v.string()),
    content_json: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingNote = await ctx.db.get(args.noteId)

    if (!existingNote) {
      throw new ConvexError('Note not found')
    }

    // Ensure the note belongs to the requesting user
    if (existingNote.user_id !== args.user_id) {
      throw new ConvexError('Unauthorized: Note does not belong to user')
    }

    const updateData: {
      updated_at: number
      title?: string
      content?: string
      content_html?: string
      content_json?: string
    } = {
      updated_at: Date.now(),
    }

    if (args.title !== undefined) updateData.title = args.title
    if (args.content !== undefined) updateData.content = args.content
    if (args.content_html !== undefined)
      updateData.content_html = args.content_html
    if (args.content_json !== undefined)
      updateData.content_json = args.content_json

    await ctx.db.patch(args.noteId, updateData)

    return args.noteId
  },
})

// Delete a note
export const deleteNote = mutation({
  args: {
    noteId: v.id('notes'),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existingNote = await ctx.db.get(args.noteId)

    if (!existingNote) {
      throw new ConvexError('Note not found')
    }

    // Ensure the note belongs to the requesting user
    if (existingNote.user_id !== args.user_id) {
      throw new ConvexError('Unauthorized: Note does not belong to user')
    }

    await ctx.db.delete(args.noteId)

    return args.noteId
  },
})
