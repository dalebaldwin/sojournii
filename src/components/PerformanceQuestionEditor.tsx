'use client'

import { Button } from '@/components/ui/button'
import { PerformanceQuestion } from '@/lib/welcome-data'
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
      question.title.trim().length > 0 && question.description.trim().length > 0
    )
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
          <input
            className='w-full rounded border px-3 py-2 font-medium'
            value={editedQuestion.title}
            onChange={e =>
              setEditedQuestion(prev => ({ ...prev, title: e.target.value }))
            }
            placeholder='Question Title'
          />
        </div>
        <div>
          <label className='mb-1 block text-sm font-medium'>
            Question Description
          </label>
          <textarea
            className='min-h-[80px] w-full rounded border px-3 py-2'
            value={editedQuestion.description}
            onChange={e =>
              setEditedQuestion(prev => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder='Question Description'
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
          <p className='text-muted-foreground text-sm whitespace-pre-line'>
            {question.description}
          </p>
        </div>
        <Button size='sm' variant='outline' onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  )
}
