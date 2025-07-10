'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import {
  useCreateResponse,
  usePerformanceQuestions,
  useUpdateResponse,
  useWeeklyResponses,
} from '@/hooks/usePerformance'
import type { JSONContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Id } from '../../../../../convex/_generated/dataModel'

interface PerformanceSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  nextStep: () => void
  prevStep: () => void
}

export function PerformanceSection({
  selectedWeek,
  nextStep,
  prevStep,
}: PerformanceSectionProps) {
  const [responseData, setResponseData] = useState<
    Record<
      string,
      {
        content: string
        html: string
        json: string
        responseId?: Id<'performance_responses'>
      }
    >
  >({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({})

  // Get performance questions and responses
  const questions = usePerformanceQuestions()
  const weeklyResponses = useWeeklyResponses(selectedWeek.startDate)
  const createResponse = useCreateResponse()
  const updateResponse = useUpdateResponse()

  // Initialize response data with existing responses
  useEffect(() => {
    if (questions && weeklyResponses) {
      const initialData: Record<
        string,
        {
          content: string
          html: string
          json: string
          responseId?: Id<'performance_responses'>
        }
      > = {}

      questions.forEach(question => {
        if (question.is_active) {
          const existingResponse = weeklyResponses.responses.find(
            r => r.question_id === question._id
          )

          initialData[question._id] = {
            content: existingResponse?.response || '',
            html: existingResponse?.response_html || '',
            json: existingResponse?.response_json || '',
            responseId: existingResponse?._id,
          }
        }
      })

      setResponseData(initialData)
    }
  }, [questions, weeklyResponses])

  const handleResponseChange = (
    questionId: string,
    data: { html: string; json: JSONContent }
  ) => {
    // Extract plain text from HTML for storage
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = data.html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    setResponseData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        content: plainText,
        html: data.html,
        json: JSON.stringify(data.json),
      },
    }))

    setHasChanges(prev => ({
      ...prev,
      [questionId]: true,
    }))
  }

  const handleSave = async (questionId: string) => {
    const data = responseData[questionId]
    if (!data) return

    setSaving(prev => ({ ...prev, [questionId]: true }))

    try {
      if (data.responseId) {
        // Update existing response
        await updateResponse({
          id: data.responseId,
          response: data.content,
          response_html: data.html,
          response_json: data.json,
        })
      } else {
        // Create new response
        const newResponse = await createResponse({
          questionId: questionId as Id<'performance_questions'>,
          weekStartDate: selectedWeek.startDate,
          response: data.content,
          response_html: data.html,
          response_json: data.json,
        })

        // Update local state with new response ID
        setResponseData(prev => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            responseId: newResponse,
          },
        }))
      }

      setHasChanges(prev => ({ ...prev, [questionId]: false }))
      toast.success('Response saved successfully!')
    } catch (error) {
      console.error('Failed to save response:', error)
      toast.error('Failed to save response. Please try again.')
    } finally {
      setSaving(prev => ({ ...prev, [questionId]: false }))
    }
  }

  // Save is handled on navigation only

  const handleNext = () => {
    // Save any pending changes before moving to next step
    const pendingChanges = Object.keys(hasChanges).filter(id => hasChanges[id])

    if (pendingChanges.length > 0) {
      Promise.all(pendingChanges.map(id => handleSave(id))).then(() => {
        nextStep()
      })
    } else {
      nextStep()
    }
  }

  const handlePrev = () => {
    // Save any pending changes before moving to previous step
    const pendingChanges = Object.keys(hasChanges).filter(id => hasChanges[id])

    if (pendingChanges.length > 0) {
      Promise.all(pendingChanges.map(id => handleSave(id))).then(() => {
        prevStep()
      })
    } else {
      prevStep()
    }
  }

  if (!questions) {
    return (
      <div className='space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800'>
        <div className='text-center'>
          <div className='text-muted-foreground'>Loading questions...</div>
        </div>
      </div>
    )
  }

  const activeQuestions = questions.filter(q => q.is_active)

  return (
    <div className='mx-auto max-w-3xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-2xl font-bold'>
          Performance Questions
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>
          Answer your performance questions for this week. These help track your
          progress and growth.
        </p>
        <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
          <div className='text-lg font-semibold text-blue-700 dark:text-blue-300'>
            {selectedWeek.weekRange}
          </div>
        </div>
      </div>

      {activeQuestions.length === 0 ? (
        <div className='py-8 text-center'>
          <div className='text-muted-foreground'>
            No active performance questions found. You can add questions in the
            Performance section.
          </div>
        </div>
      ) : (
        <div className='space-y-6'>
          {activeQuestions.map(question => {
            const questionData = responseData[question._id]
            const isCurrentlySaving = saving[question._id]
            const hasCurrentChanges = hasChanges[question._id]

            return (
              <div
                key={question._id}
                className='space-y-4 rounded-lg border p-6'
              >
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>{question.title}</h3>
                  {question.description && (
                    <div className='text-muted-foreground text-sm'>
                      {question.description_json ? (
                        <div className='prose prose-sm dark:prose-invert max-w-none'>
                          <TiptapRenderer
                            content={JSON.parse(question.description_json)}
                          />
                        </div>
                      ) : (
                        <p>{question.description}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <TiptapEditor
                    content={questionData?.json || questionData?.content || ''}
                    onUpdate={data => handleResponseChange(question._id, data)}
                    placeholder='Share your thoughts and progress...'
                    className='min-h-[120px]'
                  />

                  {hasCurrentChanges && (
                    <div className='text-sm text-orange-600 dark:text-orange-400'>
                      {isCurrentlySaving
                        ? 'Saving...'
                        : 'Changes will be saved when you continue...'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' onClick={handlePrev}>
          Previous
        </Button>
        <Button onClick={handleNext}>Next: Goal Progress</Button>
      </div>
    </div>
  )
}
