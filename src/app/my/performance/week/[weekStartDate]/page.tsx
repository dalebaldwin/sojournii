'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import {
  useCreateResponse,
  useDeleteResponse,
  useUpdateResponse,
  useWeeklyResponses,
  type PerformanceQuestion,
  type PerformanceResponse,
} from '@/hooks/usePerformance'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Edit, Plus, Save, Trash2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Id } from '../../../../../../convex/_generated/dataModel'

interface QuestionResponseData {
  question: PerformanceQuestion
  responses: PerformanceResponse[]
  editingResponseId?: Id<'performance_responses'>
  newResponse: {
    content: string
    html: string
    json: string
  }
}

export default function WeeklyPerformancePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const weekStartDate = params.weekStartDate as string
  const mode = searchParams.get('mode') || 'view'

  const weeklyData = useWeeklyResponses(weekStartDate)
  const createResponse = useCreateResponse()
  const updateResponse = useUpdateResponse()
  const deleteResponse = useDeleteResponse()

  // State for managing responses being edited/created
  const [questionData, setQuestionData] = useState<
    Map<Id<'performance_questions'>, QuestionResponseData>
  >(new Map())

  // Calculate week end date
  const weekEndDate = useMemo(() => {
    const startDate = parseISO(weekStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return endDate.toISOString().split('T')[0]
  }, [weekStartDate])

  // Initialize question data when weekly data loads
  useMemo(() => {
    if (!weeklyData) return

    const newQuestionData = new Map<
      Id<'performance_questions'>,
      QuestionResponseData
    >()

    weeklyData.questions.forEach(question => {
      const questionResponses = weeklyData.responses.filter(
        r => r.question_id === question._id
      )

      newQuestionData.set(question._id, {
        question,
        responses: questionResponses,
        newResponse: {
          content: '',
          html: '',
          json: '',
        },
      })
    })

    setQuestionData(newQuestionData)
  }, [weeklyData])

  if (!weeklyData) {
    return (
      <div className='mx-auto max-w-4xl p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-64 rounded bg-gray-200'></div>
          <div className='h-4 w-96 rounded bg-gray-200'></div>
          <div className='h-32 rounded bg-gray-200'></div>
        </div>
      </div>
    )
  }

  const handleNewResponseChange = (
    questionId: Id<'performance_questions'>,
    content: string,
    html: string,
    json: string
  ) => {
    setQuestionData(prev => {
      const updated = new Map(prev)
      const data = updated.get(questionId)
      if (data) {
        updated.set(questionId, {
          ...data,
          newResponse: { content, html, json },
        })
      }
      return updated
    })
  }

  const handleCreateResponse = async (
    questionId: Id<'performance_questions'>
  ) => {
    const data = questionData.get(questionId)
    if (!data || !data.newResponse.content.trim()) return

    try {
      await createResponse({
        questionId,
        response: data.newResponse.content,
        response_html: data.newResponse.html,
        response_json: data.newResponse.json,
        weekStartDate,
      })

      // Clear the new response content
      handleNewResponseChange(questionId, '', '', '')
      toast.success('Response added successfully')
    } catch (error) {
      console.error('Failed to create response:', error)
      toast.error('Failed to save response')
    }
  }

  const handleUpdateResponse = async (
    responseId: Id<'performance_responses'>,
    content: string,
    html: string,
    json: string
  ) => {
    try {
      await updateResponse({
        id: responseId,
        response: content,
        response_html: html,
        response_json: json,
      })

      // Clear editing state
      setQuestionData(prev => {
        const updated = new Map(prev)
        for (const [key, value] of updated) {
          if (value.editingResponseId === responseId) {
            updated.set(key, {
              ...value,
              editingResponseId: undefined,
            })
          }
        }
        return updated
      })

      toast.success('Response updated successfully')
    } catch (error) {
      console.error('Failed to update response:', error)
      toast.error('Failed to update response')
    }
  }

  const handleDeleteResponse = async (
    responseId: Id<'performance_responses'>
  ) => {
    if (!confirm('Are you sure you want to delete this response?')) return

    try {
      await deleteResponse({ id: responseId })
      toast.success('Response deleted successfully')
    } catch (error) {
      console.error('Failed to delete response:', error)
      toast.error('Failed to delete response')
    }
  }

  const startEditing = (
    questionId: Id<'performance_questions'>,
    responseId: Id<'performance_responses'>
  ) => {
    setQuestionData(prev => {
      const updated = new Map(prev)
      const data = updated.get(questionId)
      if (data) {
        updated.set(questionId, {
          ...data,
          editingResponseId: responseId,
        })
      }
      return updated
    })
  }

  const stopEditing = (questionId: Id<'performance_questions'>) => {
    setQuestionData(prev => {
      const updated = new Map(prev)
      const data = updated.get(questionId)
      if (data) {
        updated.set(questionId, {
          ...data,
          editingResponseId: undefined,
        })
      }
      return updated
    })
  }

  return (
    <div className='mx-auto max-w-4xl space-y-8 p-8'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/my/performance'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Performance
            </Link>
          </Button>
        </div>

        <Heading level='h2' className='flex items-center gap-2'>
          <TrendingUp className='h-6 w-6' />
          Week of {format(parseISO(weekStartDate), 'MMM d')} -{' '}
          {format(parseISO(weekEndDate), 'MMM d, yyyy')}
        </Heading>

        <p className='text-muted-foreground'>
          Add notes and responses to your performance questions for this week
        </p>
      </div>

      {/* Questions and Responses */}
      <div className='space-y-8'>
        {weeklyData.questions.map(question => {
          const data = questionData.get(question._id)
          if (!data) return null

          return (
            <div key={question._id} className='space-y-4 rounded-lg border p-6'>
              {/* Question Header */}
              <div className='space-y-2'>
                <h3 className='text-lg font-medium'>{question.title}</h3>
                {question.description && (
                  <TiptapRenderer
                    content={question.description_json || question.description}
                  />
                )}
              </div>

              {/* Existing Responses */}
              {data.responses.length > 0 && (
                <div className='space-y-4'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Previous responses this week:
                  </h4>

                  {data.responses.map(response => (
                    <div
                      key={response._id}
                      className='bg-muted/50 space-y-3 rounded-lg p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground text-sm'>
                          {format(
                            new Date(response.created_at),
                            'MMM d, h:mm a'
                          )}
                        </span>
                        {mode === 'edit' && (
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                startEditing(question._id, response._id)
                              }
                              disabled={data.editingResponseId === response._id}
                            >
                              <Edit className='mr-1 h-3 w-3' />
                              Edit
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleDeleteResponse(response._id)}
                            >
                              <Trash2 className='mr-1 h-3 w-3' />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>

                      {data.editingResponseId === response._id ? (
                        <div className='space-y-2'>
                          <TiptapEditor
                            content={
                              response.response_json || response.response
                            }
                            onUpdate={({ html: _html, json: _json }) => {
                              // Store the updated content temporarily
                              // We'll handle saving when the user clicks Save
                            }}
                            placeholder='Edit your response...'
                            editable={true}
                          />
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              onClick={async e => {
                                const editor = e.currentTarget
                                  .closest('.space-y-2')
                                  ?.querySelector('.ProseMirror')
                                if (editor) {
                                  const content = editor.textContent || ''
                                  await handleUpdateResponse(
                                    response._id,
                                    content,
                                    '',
                                    ''
                                  )
                                }
                              }}
                            >
                              <Save className='mr-1 h-3 w-3' />
                              Save
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => stopEditing(question._id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <TiptapRenderer
                          content={response.response_json || response.response}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Response */}
              {mode === 'edit' && (
                <div className='space-y-3'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Add new response:
                  </h4>

                  <TiptapEditor
                    content={data.newResponse.json || data.newResponse.content}
                    onUpdate={({ html, json }) =>
                      handleNewResponseChange(
                        question._id,
                        json.toString(),
                        html,
                        JSON.stringify(json)
                      )
                    }
                    placeholder={`Add a note about "${question.title}"...`}
                    editable={true}
                  />

                  <Button
                    onClick={() => handleCreateResponse(question._id)}
                    disabled={!data.newResponse.content.trim()}
                    size='sm'
                  >
                    <Plus className='mr-1 h-3 w-3' />
                    Add Response
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* No Questions State */}
      {weeklyData.questions.length === 0 && (
        <div className='space-y-4 py-8 text-center'>
          <TrendingUp className='mx-auto h-12 w-12 text-gray-400' />
          <div className='space-y-2'>
            <h3 className='text-lg font-medium'>No Performance Questions</h3>
            <p className='text-muted-foreground'>
              Set up performance questions in your settings to start tracking.
            </p>
          </div>
          <Button asChild>
            <Link href='/my/settings'>Go to Settings</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
