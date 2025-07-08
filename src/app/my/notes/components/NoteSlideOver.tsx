'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { useDeleteNote, useNote, useUpdateNote } from '@/hooks/useNotes'
import { JSONContent } from '@tiptap/react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { Edit3, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Id } from '../../../../../convex/_generated/dataModel'

interface DraftNote {
  id: 'draft'
  title: string
  content: string
  content_html?: string
  content_json?: string
  isDraft: true
}

interface NoteSlideOverProps {
  noteId: Id<'notes'> | 'draft' | null
  isOpen: boolean
  onClose: () => void
  draftNote?: DraftNote | null
  onSaveDraft?: (draftData: {
    title: string
    content: string
    content_html?: string
    content_json?: string
  }) => Promise<Id<'notes'>>
  onCloseDraft?: () => void
}

export function NoteSlideOver({
  noteId,
  isOpen,
  onClose,
  draftNote,
  onSaveDraft,
  onCloseDraft,
}: NoteSlideOverProps) {
  const { note, isLoading } = useNote(noteId !== 'draft' ? noteId : null)
  const { mutate: updateNote } = useUpdateNote()
  const { mutate: deleteNote } = useDeleteNote()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<JSONContent | string>('')
  const [contentHtml, setContentHtml] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isDraftNote = noteId === 'draft'
  const currentNote = isDraftNote ? draftNote : note

  // Update local state when note changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      setContentHtml(currentNote.content_html || '')
      if ('content_json' in currentNote && currentNote.content_json) {
        try {
          setContent(JSON.parse(currentNote.content_json))
        } catch {
          setContent(currentNote.content_html || currentNote.content || '')
        }
      } else {
        setContent(currentNote.content_html || currentNote.content || '')
      }
    }
  }, [currentNote])

  // Set editing state - always start in edit mode for draft notes
  useEffect(() => {
    if (isOpen && noteId) {
      setIsEditing(isDraftNote)
    }
  }, [isOpen, noteId, isDraftNote])

  const handleSave = async () => {
    if (!title.trim()) return

    setIsSaving(true)
    try {
      if (isDraftNote && onSaveDraft) {
        // Extract plain text content from JSONContent if needed
        let plainTextContent = ''
        if (typeof content === 'string') {
          plainTextContent = content
        } else if (content && typeof content === 'object') {
          // Extract text from JSONContent - simple extraction for plain text
          plainTextContent = extractTextFromJSON(content)
        }

        // Save draft note to database
        await onSaveDraft({
          title: title.trim(),
          content: plainTextContent,
          content_html:
            contentHtml || (typeof content === 'string' ? content : ''),
          content_json:
            typeof content === 'object' ? JSON.stringify(content) : '',
        })
      } else if (note && noteId !== 'draft') {
        // Update existing note
        await updateNote(noteId as Id<'notes'>, {
          title: title.trim(),
        })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Helper function to extract plain text from JSONContent
  const extractTextFromJSON = (jsonContent: JSONContent | string): string => {
    if (!jsonContent) return ''

    if (typeof jsonContent === 'string') return jsonContent

    if (jsonContent.type === 'text') {
      return jsonContent.text || ''
    }

    if (jsonContent.content && Array.isArray(jsonContent.content)) {
      return jsonContent.content
        .map((node: JSONContent) => extractTextFromJSON(node))
        .join('')
    }

    return ''
  }

  const handleTiptapUpdate = async (editorContent: {
    html: string
    json: JSONContent
  }) => {
    setContent(editorContent.json)
    setContentHtml(editorContent.html)

    // Auto-save for existing notes, but not for drafts
    if (!isDraftNote && noteId) {
      try {
        await updateNote(noteId as Id<'notes'>, {
          content: editorContent.html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text content
          content_html: editorContent.html,
          content_json: JSON.stringify(editorContent.json),
        })
      } catch (error) {
        console.error('Failed to update note content:', error)
      }
    }
  }

  const handleDelete = async () => {
    if (isDraftNote) {
      if (onCloseDraft) onCloseDraft()
      return
    }

    if (
      !noteId ||
      noteId === 'draft' ||
      !confirm(
        'Are you sure you want to delete this note? This action cannot be undone.'
      )
    )
      return

    setIsDeleting(true)
    try {
      await deleteNote(noteId)
      onClose()
    } catch (error) {
      console.error('Failed to delete note:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (isDraftNote && onCloseDraft) {
      onCloseDraft()
    } else {
      onClose()
    }
  }

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className='bg-background flex h-full w-full flex-col overflow-hidden border-l shadow-lg'
    >
      {/* Header */}
      <div className='bg-muted/20 flex items-center justify-between border-b p-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClose}
            className='h-8 w-8 p-0'
          >
            <X className='h-4 w-4' />
          </Button>
          <div className='text-muted-foreground text-sm'>
            {isDraftNote ? (
              'New Note'
            ) : currentNote && 'created_at' in currentNote ? (
              <>
                Created {formatDate(currentNote.created_at)}
                {currentNote.updated_at !== currentNote.created_at && (
                  <> • Updated {formatDate(currentNote.updated_at)}</>
                )}
              </>
            ) : null}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {!isEditing && !isDraftNote ? (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditing(true)}
              className='flex items-center gap-2'
            >
              <Edit3 className='h-4 w-4' />
              Edit
            </Button>
          ) : (
            <Button
              variant='outline'
              size='sm'
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className='flex items-center gap-2'
            >
              <Save className='h-4 w-4' />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={handleDelete}
            disabled={isDeleting}
            className='text-destructive hover:text-destructive flex items-center gap-2'
          >
            <Trash2 className='h-4 w-4' />
            {isDraftNote ? 'Cancel' : isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-hidden'>
        {isLoading && !isDraftNote ? (
          <div className='flex h-full items-center justify-center'>
            <div className='text-muted-foreground'>Loading note...</div>
          </div>
        ) : currentNote ? (
          <div className='flex h-full flex-col'>
            {/* Title */}
            <div className='border-b p-6'>
              {isEditing || isDraftNote ? (
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='Note title...'
                  className='border-none bg-transparent p-0 text-xl font-medium focus-visible:ring-0 focus-visible:ring-offset-0'
                />
              ) : (
                <h1 className='text-xl font-medium'>{currentNote.title}</h1>
              )}
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6'>
              {isEditing || isDraftNote ? (
                <TiptapEditor
                  content={content}
                  onUpdate={handleTiptapUpdate}
                  placeholder='Start writing your note...'
                  className='min-h-full'
                  minHeight='calc(100vh - 300px)'
                />
              ) : (
                <div className='prose prose-sm max-w-none'>
                  {currentNote.content_html ? (
                    <TiptapRenderer content={currentNote.content_html} />
                  ) : currentNote.content_json ? (
                    <TiptapRenderer
                      content={JSON.parse(currentNote.content_json)}
                    />
                  ) : (
                    <div className='text-muted-foreground py-12 text-center italic'>
                      {currentNote.content ||
                        'No content yet. Click Edit to start writing.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div className='text-muted-foreground'>Note not found</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
