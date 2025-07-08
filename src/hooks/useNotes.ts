import { useUser } from '@clerk/nextjs'
import { JSONContent } from '@tiptap/react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export function useNotes() {
  const { user } = useUser()
  const userId = user?.id

  const notes = useQuery(
    api.notes.listNotes,
    userId ? { user_id: userId } : 'skip'
  )

  return {
    notes,
    isLoading: notes === undefined,
  }
}

export function useNote(noteId: Id<'notes'> | null) {
  const { user } = useUser()
  const userId = user?.id

  const note = useQuery(
    api.notes.getNote,
    noteId && userId ? { noteId, user_id: userId } : 'skip'
  )

  return {
    note,
    isLoading: note === undefined,
  }
}

export function useCreateNote() {
  const { user } = useUser()
  const createNote = useMutation(api.notes.createNote)

  const mutate = async (data: {
    title: string
    content: string
    content_html?: string
    content_json?: string
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    return await createNote({
      user_id: user.id,
      ...data,
    })
  }

  return { mutate }
}

export function useUpdateNote() {
  const { user } = useUser()
  const updateNote = useMutation(api.notes.updateNote)

  const mutate = async (
    noteId: Id<'notes'>,
    data: {
      title?: string
      content?: string
      content_html?: string
      content_json?: string
    }
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    return await updateNote({
      noteId,
      user_id: user.id,
      ...data,
    })
  }

  return { mutate }
}

export function useDeleteNote() {
  const { user } = useUser()
  const deleteNote = useMutation(api.notes.deleteNote)

  const mutate = async (noteId: Id<'notes'>) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    return await deleteNote({
      noteId,
      user_id: user.id,
    })
  }

  return { mutate }
}

// Helper hook for TipTap integration
export function useNoteTipTap(
  noteId: Id<'notes'> | null,
  onSave?: (content: { html: string; json: JSONContent }) => void
) {
  const { note } = useNote(noteId)
  const { mutate: updateNote } = useUpdateNote()

  const handleSave = async (content: { html: string; json: JSONContent }) => {
    if (!noteId) return

    await updateNote(noteId, {
      content_html: content.html,
      content_json: JSON.stringify(content.json),
    })

    onSave?.(content)
  }

  return {
    note,
    handleSave,
    initialContent: note?.content_json
      ? JSON.parse(note.content_json)
      : note?.content_html || note?.content || '',
  }
}
