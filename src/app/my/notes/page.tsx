'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { useCreateNote, useNotes } from '@/hooks/useNotes'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { NoteSlideOver } from './components/NoteSlideOver'

interface Note {
  _id: Id<'notes'>
  title: string
  content: string
  content_html?: string
  content_json?: string
  created_at: number
  updated_at: number
}

interface DraftNote {
  id: 'draft'
  title: string
  content: string
  content_html?: string
  content_json?: string
  isDraft: true
}

export default function NotesPage() {
  const { notes, isLoading } = useNotes()
  const { mutate: createNote } = useCreateNote()
  const [selectedNoteId, setSelectedNoteId] = useState<
    Id<'notes'> | 'draft' | null
  >(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [draftNote, setDraftNote] = useState<DraftNote | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Remove initial load flag after component mounts
  useEffect(() => {
    setIsInitialLoad(false)
  }, [])

  const handleCreateNote = () => {
    const newDraft: DraftNote = {
      id: 'draft',
      title: 'New Note',
      content: '',
      content_html: '',
      content_json: '',
      isDraft: true,
    }
    setDraftNote(newDraft)
    setSelectedNoteId('draft')
  }

  const handleSaveDraft = async (draftData: {
    title: string
    content: string
    content_html?: string
    content_json?: string
  }) => {
    try {
      const noteId = await createNote(draftData)
      setDraftNote(null)
      setSelectedNoteId(noteId)
      return noteId
    } catch (error) {
      console.error('Failed to create note:', error)
      throw error
    }
  }

  const handleCloseDraft = () => {
    setDraftNote(null)
    setSelectedNoteId(null)
  }

  const filteredNotes =
    notes?.filter(
      note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  const isPanelOpen = selectedNoteId !== null

  if (isLoading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <div className='text-muted-foreground'>Loading notes...</div>
      </div>
    )
  }

  return (
    <div className='relative h-full overflow-hidden'>
      {/* Main Content Area - always sized as if panel is open, uses margin for positioning */}
      <div
        className={`h-full ${!isInitialLoad ? 'transition-all duration-300 ease-in-out' : ''}`}
        style={{
          width: 'calc(100vw - 275px - 800px)',
          marginLeft: isPanelOpen ? '0px' : '400px',
        }}
      >
        <div className='h-full space-y-8 overflow-y-auto p-8'>
          {/* Header */}
          <PageHeader
            title='Notes'
            description='Capture your thoughts and ideas'
          >
            {/* Search and New Note Button on same line */}
            <div className='flex items-center gap-4'>
              <div className='relative flex-1'>
                <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                <Input
                  placeholder='Search notes...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Button
                onClick={handleCreateNote}
                className='flex shrink-0 items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                New Note
              </Button>
            </div>
          </PageHeader>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className='py-16 text-center'>
              <div className='text-muted-foreground mb-6 text-lg'>
                {searchTerm
                  ? 'No notes found matching your search.'
                  : 'No notes yet.'}
              </div>
              {!searchTerm && (
                <Button onClick={handleCreateNote} size='lg'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create your first note
                </Button>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {filteredNotes.map((note: Note) => (
                <div
                  key={note._id}
                  className={`group bg-background hover:bg-muted/50 flex min-h-[200px] cursor-pointer flex-col justify-between rounded-lg border p-6 transition-all duration-200 ${
                    selectedNoteId === note._id
                      ? 'ring-primary ring-2 ring-offset-2'
                      : ''
                  }`}
                  onClick={() => setSelectedNoteId(note._id)}
                >
                  <div>
                    <h3 className='group-hover:text-primary mb-3 line-clamp-2 text-base font-medium'>
                      {note.title}
                    </h3>
                    <p className='text-muted-foreground mb-4 line-clamp-4 text-sm'>
                      {note.content || 'No content'}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-muted-foreground text-xs'>
                      Created {formatDate(note.created_at)}
                    </div>
                    {note.updated_at !== note.created_at && (
                      <div className='text-muted-foreground text-xs'>
                        Updated {formatDate(note.updated_at)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Panel - Fixed positioned, slides in from right */}
      {isPanelOpen && (
        <div className='fixed top-0 right-0 z-30 h-full w-[800px]'>
          <NoteSlideOver
            noteId={selectedNoteId}
            isOpen={true}
            onClose={() => setSelectedNoteId(null)}
            draftNote={draftNote}
            onSaveDraft={handleSaveDraft}
            onCloseDraft={handleCloseDraft}
          />
        </div>
      )}
    </div>
  )
}
