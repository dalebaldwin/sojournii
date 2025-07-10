'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { JSONContent } from '@tiptap/react'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

interface PerformanceQuestionSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  questionId: string
  questionTitle: string
  questionDescription?: string
  questionDescriptionJson?: string
  questionIndex: number
  totalQuestions: number
  nextStep: () => void
  prevStep: () => void
}

export function PerformanceQuestionSection({
  selectedWeek,
  questionId,
  questionTitle,
  questionDescription,
  questionDescriptionJson,
  questionIndex,
  totalQuestions,
  nextStep,
  prevStep,
}: PerformanceQuestionSectionProps) {
  const [responseData, setResponseData] = useState({
    content: '',
    html: '',
    json: '',
    responseId: undefined as string | undefined,
  })
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Get performance data hooks
  const weeklyResponses = useQuery(
    api.performanceResponses.getWeeklyResponses,
    {
      weekStartDate: selectedWeek.startDate,
    }
  )
  const createResponse = useMutation(api.performanceResponses.createResponse)
  const updateResponse = useMutation(api.performanceResponses.updateResponse)

  // Initialize response data from existing response if available
  useEffect(() => {
    if (weeklyResponses) {
      const existingResponse = weeklyResponses.responses.find(
        (r: { question_id: string }) => r.question_id === questionId
      )

      if (existingResponse) {
        setResponseData({
          content: existingResponse.response || '',
          html: existingResponse.response_html || '',
          json: existingResponse.response_json || '',
          responseId: existingResponse._id,
        })
      }
    }
  }, [weeklyResponses, questionId])

  const handleResponseChange = (data: { html: string; json: JSONContent }) => {
    // Extract plain text from HTML for storage
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = data.html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    setResponseData(prev => ({
      ...prev,
      content: plainText,
      html: data.html,
      json: JSON.stringify(data.json),
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (responseData.responseId) {
        // Update existing response
        await updateResponse({
          id: responseData.responseId as Id<'performance_responses'>,
          response: responseData.content,
          response_html: responseData.html,
          response_json: responseData.json,
        })
      } else {
        // Create new response
        const newResponse = await createResponse({
          questionId: questionId as Id<'performance_questions'>,
          weekStartDate: selectedWeek.startDate,
          response: responseData.content,
          response_html: responseData.html,
          response_json: responseData.json,
        })

        // Update local state with new response ID
        setResponseData(prev => ({
          ...prev,
          responseId: newResponse,
        }))
      }

      setHasChanges(false)
      toast.success('Response saved successfully!')
    } catch (error) {
      console.error('Failed to save response:', error)
      toast.error('Failed to save response. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    if (hasChanges) {
      // Save before moving to next step
      handleSave().then(() => {
        nextStep()
      })
    } else {
      nextStep()
    }
  }

  const handlePrev = () => {
    if (hasChanges) {
      // Save before moving to previous step
      handleSave().then(() => {
        prevStep()
      })
    } else {
      prevStep()
    }
  }

  return (
    <div className='mx-auto max-w-2xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-3xl font-normal'>
          {questionTitle}
        </Heading>
        {questionDescription && (
          <div className='text-muted-foreground mb-6 text-lg'>
            {questionDescriptionJson ? (
              <div className='prose prose-lg dark:prose-invert mx-auto max-w-none'>
                <TiptapRenderer content={JSON.parse(questionDescriptionJson)} />
              </div>
            ) : (
              <p>{questionDescription}</p>
            )}
          </div>
        )}
        <div className='mb-6 text-xl font-semibold'>
          {selectedWeek.weekRange}
        </div>
        <div className='text-sm text-gray-500'>
          Question {questionIndex} of {totalQuestions}
        </div>
      </div>

      <div className='space-y-8'>
        <TiptapEditor
          content={responseData.json || responseData.content || ''}
          onUpdate={handleResponseChange}
          placeholder='Share your thoughts and progress...'
          className='min-h-[200px]'
        />

        {hasChanges && (
          <div className='text-center'>
            <div className='text-sm text-orange-600 dark:text-orange-400'>
              Changes will be saved when you continue...
            </div>
          </div>
        )}
      </div>

      <div className='flex justify-between pt-8'>
        <Button variant='outline' onClick={handlePrev} size='lg'>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={saving} size='lg'>
          {saving ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
