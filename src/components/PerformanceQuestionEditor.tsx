'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { PerformanceQuestion } from '@/lib/welcome-data'
import type { JSONContent } from '@tiptap/react'
import { useState } from 'react'

interface PerformanceQuestionEditorProps {
  question: PerformanceQuestion
  index: number
  onUpdate: (
    index: number,
    updatedQuestion: PerformanceQuestion
  ) => Promise<void>
  onDelete: (index: number) => void
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  isSaving?: boolean
}

export function PerformanceQuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving = false,
}: PerformanceQuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] =
    useState<PerformanceQuestion>(question)
  const [validationError, setValidationError] = useState('')

  const validateQuestion = (question: PerformanceQuestion): boolean => {
    return (
      question.title.trim().length > 0 &&
      (question.description.trim().length > 0 ||
        Boolean(question.description_html))
    )
  }

  const handleDescriptionUpdate = (content: {
    html: string
    json: JSONContent
  }) => {
    setEditedQuestion(prev => ({
      ...prev,
      description: content.html || '', // Fallback to HTML for legacy compatibility
      description_html: content.html,
      description_json: JSON.stringify(content.json),
    }))
  }

  const handleSave = async () => {
    // Clear previous validation error
    setValidationError('')

    // Validate the question
    if (!validateQuestion(editedQuestion)) {
      setValidationError('Please fill in both title and description')
      return
    }

    try {
      await onUpdate(index, editedQuestion)
      onSave()
    } catch (error) {
      console.error('Error saving question:', error)
      setValidationError('Failed to save question. Please try again.')
    }
  }

  const handleCancel = () => {
    setEditedQuestion(question) // Reset to original
    setValidationError('') // Clear validation error
    onCancel()
  }

  if (isEditing) {
    return (
      <div className='border-border bg-background space-y-3 rounded-lg border p-4'>
        <div>
          <label className='mb-1 block text-sm font-medium'>
            Question Title
          </label>
          <Input
            value={editedQuestion.title}
            onChange={e =>
              setEditedQuestion(prev => ({ ...prev, title: e.target.value }))
            }
            placeholder='Question Title'
            className='font-medium'
          />
        </div>
        <div>
          <label className='mb-1 block text-sm font-medium'>
            Question Description
          </label>
          <TiptapEditor
            content={
              editedQuestion.description_json
                ? JSON.parse(editedQuestion.description_json)
                : editedQuestion.description
            }
            onUpdate={handleDescriptionUpdate}
            placeholder='Question Description'
            minHeight='80px'
          />
        </div>
        <div className='flex gap-2'>
          <Button size='sm' onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Question'}
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={() => onDelete(index)}
            disabled={isSaving}
            className='ml-auto'
          >
            Delete
          </Button>
        </div>
        {validationError && (
          <p className='mt-2 text-sm text-red-500'>{validationError}</p>
        )}
      </div>
    )
  }

  return (
    <div className='border-border bg-muted rounded-lg border p-4'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <h3 className='mb-2 font-medium'>{question.title}</h3>
          <div className='text-muted-foreground text-sm'>
            <TiptapRenderer
              content={question.description_html}
              fallback={question.description}
            />
          </div>
        </div>
        <Button size='sm' variant='outline' onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  )
}
