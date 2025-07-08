'use client'

import { PerformanceQuestionEditor } from '@/components/PerformanceQuestionEditor'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { useUpdateAccountSettings } from '@/hooks/useAccountSettings'
import { PerformanceQuestion } from '@/lib/welcome-data'
import { useCallback, useEffect, useState } from 'react'
import { Doc } from '../../../../../convex/_generated/dataModel'

interface PerformanceQuestionsSectionProps {
  accountSettings: Doc<'account_settings'> | null | undefined
}

export function PerformanceQuestionsSection({
  accountSettings,
}: PerformanceQuestionsSectionProps) {
  const updateAccountSettings = useUpdateAccountSettings()
  const [perfQuestions, setPerfQuestions] = useState<PerformanceQuestion[]>([])
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null)
  const [saving, setSaving] = useState(false)

  // Clean up blank questions from database
  const cleanupBlankQuestions = useCallback(
    async (validQuestions: PerformanceQuestion[]) => {
      if (!accountSettings?._id) return

      try {
        await updateAccountSettings({
          id: accountSettings._id,
          perf_questions: validQuestions,
        })
      } catch (error) {
        console.error('Error cleaning up blank questions:', error)
      }
    },
    [accountSettings?._id, updateAccountSettings]
  )

  // Sync performance questions with account settings
  useEffect(() => {
    if (!accountSettings?.perf_questions) return

    // Filter out any blank questions when loading
    const validQuestions = accountSettings.perf_questions.filter(
      (q: PerformanceQuestion) => q.title.trim() && q.description.trim()
    )
    setPerfQuestions(validQuestions)

    // Clean up any blank questions in the database
    if (accountSettings.perf_questions.length !== validQuestions.length) {
      cleanupBlankQuestions(validQuestions)
    }
  }, [accountSettings?.perf_questions, cleanupBlankQuestions])

  const validateQuestion = useCallback(
    (question: PerformanceQuestion): boolean => {
      return (
        question.title.trim().length > 0 &&
        question.description.trim().length > 0
      )
    },
    []
  )

  const handleUpdateQuestion = useCallback(
    async (index: number, updatedQuestion: PerformanceQuestion) => {
      if (!validateQuestion(updatedQuestion) || !accountSettings?._id) return

      const newQuestions = [...perfQuestions]
      newQuestions[index] = updatedQuestion

      try {
        await updateAccountSettings({
          id: accountSettings._id,
          perf_questions: newQuestions,
        })
      } catch (error) {
        console.error('Error updating question:', error)
      }
    },
    [
      perfQuestions,
      validateQuestion,
      accountSettings?._id,
      updateAccountSettings,
    ]
  )

  const handleDeleteQuestion = useCallback(
    async (index: number) => {
      if (!accountSettings?._id) return

      const newQuestions = perfQuestions.filter((_, i) => i !== index)

      try {
        await updateAccountSettings({
          id: accountSettings._id,
          perf_questions: newQuestions,
        })
      } catch (error) {
        console.error('Error deleting question:', error)
      }
    },
    [perfQuestions, accountSettings?._id, updateAccountSettings]
  )

  const handleAddQuestion = useCallback(() => {
    const newQuestion: PerformanceQuestion = {
      title: '',
      description: '',
      description_html: '',
      description_json: '',
    }
    setPerfQuestions(prev => [...prev, newQuestion])
    setEditingQuestionIndex(perfQuestions.length)
  }, [perfQuestions.length])

  const handleEditQuestion = useCallback((index: number) => {
    setEditingQuestionIndex(index)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingQuestionIndex(null)
  }, [])

  const handleSaveQuestion = useCallback(async () => {
    if (editingQuestionIndex === null) return

    setSaving(true)
    try {
      const question = perfQuestions[editingQuestionIndex]

      if (!validateQuestion(question)) {
        // Remove blank question from the array
        await handleDeleteQuestion(editingQuestionIndex)
      } else {
        await handleUpdateQuestion(editingQuestionIndex, question)
      }

      setEditingQuestionIndex(null)
    } catch (error) {
      console.error('Error saving question:', error)
    } finally {
      setSaving(false)
    }
  }, [
    editingQuestionIndex,
    perfQuestions,
    validateQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
  ])

  return (
    <div className='bg-muted rounded-lg p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <Heading level='h2' weight='bold'>
          Performance Questions
        </Heading>
        <Button size='sm' onClick={handleAddQuestion}>
          Add Question
        </Button>
      </div>

      {perfQuestions.length > 0 ? (
        <div className='space-y-3'>
          {perfQuestions.map((question, index) => (
            <PerformanceQuestionEditor
              key={index}
              question={question}
              index={index}
              onUpdate={handleUpdateQuestion}
              onDelete={handleDeleteQuestion}
              isEditing={editingQuestionIndex === index}
              onEdit={() => handleEditQuestion(index)}
              onCancel={handleCancelEdit}
              onSave={handleSaveQuestion}
              isSaving={saving}
            />
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground text-sm'>
          No performance questions added yet. Use these to track your
          professional goals and achievements.
        </p>
      )}
    </div>
  )
}
