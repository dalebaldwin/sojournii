'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import {
  useCreateResponse,
  useCurrentWeekInfo,
  useDeleteResponse,
  usePerformanceQuestions,
  usePerformanceResponses,
  useUpdateResponse,
  type PerformanceResponse,
} from '@/hooks/usePerformance'
import { addDays, format, parseISO } from 'date-fns'
import { Calendar, Edit, Filter, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Id } from '../../../../convex/_generated/dataModel'

interface WeekData {
  weekStartDate: string
  weekEndDate: string
  isCurrentWeek: boolean
}

export default function PerformancePage() {
  const currentWeekInfo = useCurrentWeekInfo()
  const questions = usePerformanceQuestions()
  const allResponses = usePerformanceResponses()
  const createResponse = useCreateResponse()
  const updateResponse = useUpdateResponse()
  const deleteResponse = useDeleteResponse()

  // UI State
  const [selectedQuestionId, setSelectedQuestionId] =
    useState<Id<'performance_questions'> | null>(null)
  const [editingResponseId, setEditingResponseId] =
    useState<Id<'performance_responses'> | null>(null)
  const [newResponseContent, setNewResponseContent] = useState<
    Record<string, { content: string; html: string; json: string }>
  >({})

  // Generate weeks to show (only weeks with responses + current week)
  const weeksToShow = useMemo(() => {
    if (!currentWeekInfo || !allResponses) return []

    // Get unique weeks that have responses
    const weeksWithResponses = Array.from(
      new Set(allResponses.map(response => response.week_start_date))
    )

    // Always include current week
    const currentWeekStartDate = currentWeekInfo.startDate
    if (!weeksWithResponses.includes(currentWeekStartDate)) {
      weeksWithResponses.push(currentWeekStartDate)
    }

    // Convert to WeekData objects and sort by date (newest first)
    const weeks: WeekData[] = weeksWithResponses
      .map(weekStartDate => {
        const weekStart = parseISO(weekStartDate)
        const weekEnd = addDays(weekStart, 6)

        return {
          weekStartDate,
          weekEndDate: weekEnd.toISOString().split('T')[0],
          isCurrentWeek: weekStartDate === currentWeekStartDate,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.weekStartDate).getTime() -
          new Date(a.weekStartDate).getTime()
      )

    return weeks
  }, [currentWeekInfo, allResponses])

  // Group responses by week and question
  const responsesByWeekAndQuestion = useMemo(() => {
    if (!allResponses || !questions) return {}

    const grouped: Record<string, Record<string, PerformanceResponse[]>> = {}

    allResponses.forEach(response => {
      if (!grouped[response.week_start_date]) {
        grouped[response.week_start_date] = {}
      }
      if (!grouped[response.week_start_date][response.question_id]) {
        grouped[response.week_start_date][response.question_id] = []
      }
      grouped[response.week_start_date][response.question_id].push(response)
    })

    // Sort responses within each group by creation date (newest first)
    Object.keys(grouped).forEach(week => {
      Object.keys(grouped[week]).forEach(questionId => {
        grouped[week][questionId].sort((a, b) => b.created_at - a.created_at)
      })
    })

    return grouped
  }, [allResponses, questions])

  // Filtered questions based on selected filter
  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    if (selectedQuestionId) {
      return questions.filter(q => q._id === selectedQuestionId)
    }
    return questions.filter(q => q.is_active)
  }, [questions, selectedQuestionId])

  const handleCreateResponse = async (
    questionId: Id<'performance_questions'>,
    weekStartDate: string
  ) => {
    const key = `${questionId}-${weekStartDate}`
    const content = newResponseContent[key]

    if (!content || !content.content.trim()) return

    try {
      await createResponse({
        questionId,
        response: content.content,
        response_html: content.html,
        response_json: content.json,
        weekStartDate,
      })

      // Clear the content
      setNewResponseContent(prev => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })

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

      setEditingResponseId(null)
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

  const updateNewResponseContent = (
    key: string,
    content: string,
    html: string,
    json: string
  ) => {
    setNewResponseContent(prev => ({
      ...prev,
      [key]: { content, html, json },
    }))
  }

  const resetFilter = () => {
    setSelectedQuestionId(null)
  }

  const filterToQuestion = (questionId: Id<'performance_questions'>) => {
    setSelectedQuestionId(questionId)
  }

  const selectedQuestion = selectedQuestionId
    ? questions?.find(q => q._id === selectedQuestionId)
    : null

  if (!currentWeekInfo || !questions) {
    return (
      <div className='mx-auto max-w-5xl p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-64 rounded bg-gray-200'></div>
          <div className='h-4 w-96 rounded bg-gray-200'></div>
          <div className='h-32 rounded bg-gray-200'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-5xl space-y-8 p-8'>
      {/* Header */}
      <div className='space-y-4'>
        <Heading level='h1' showLines>
          Performance Tracking
        </Heading>
        <p className='text-muted-foreground'>
          Track your progress on performance questions week by week
        </p>

        {/* Reset Filter Button */}
        {selectedQuestionId && (
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2'>
              <Filter className='h-4 w-4 text-blue-600' />
              <span className='text-sm text-blue-800'>
                Showing only: <strong>{selectedQuestion?.title}</strong>
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={resetFilter}
                className='h-6 px-2 text-blue-600 hover:text-blue-800'
              >
                <RotateCcw className='mr-1 h-3 w-3' />
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* No Questions State */}
      {questions.length === 0 && (
        <div className='space-y-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center'>
          <div className='space-y-2'>
            <h3 className='text-lg font-medium'>
              No Performance Questions Set Up
            </h3>
            <p className='text-muted-foreground'>
              You need to set up performance questions before you can start
              tracking. Questions help you reflect on your work and track your
              progress over time.
            </p>
          </div>
          <Button onClick={() => (window.location.href = '/my/settings')}>
            Set Up Questions in Settings
          </Button>
        </div>
      )}

      {/* Weekly Stream */}
      {questions.length > 0 && (
        <div className='space-y-8'>
          {weeksToShow.map(week => (
            <div key={week.weekStartDate} className='space-y-4'>
              {/* Week Header */}
              <div className='flex items-center gap-3 border-b pb-2'>
                <Calendar className='text-muted-foreground h-5 w-5' />
                <div className='flex items-center gap-2'>
                  <h2 className='text-xl font-semibold'>
                    Week of {format(parseISO(week.weekStartDate), 'MMM d')} -{' '}
                    {format(parseISO(week.weekEndDate), 'MMM d, yyyy')}
                  </h2>
                  {week.isCurrentWeek && (
                    <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                      Current Week
                    </span>
                  )}
                </div>
              </div>

              {/* Questions for this week */}
              <div className='space-y-6 pl-8'>
                {filteredQuestions.map((question, questionIndex) => {
                  const responses =
                    responsesByWeekAndQuestion[week.weekStartDate]?.[
                      question._id
                    ] || []
                  const newResponseKey = `${question._id}-${week.weekStartDate}`

                  return (
                    <div key={question._id}>
                      {/* Separator between questions (not before first question) */}
                      {questionIndex > 0 && <Separator className='my-6' />}

                      <div className='space-y-3'>
                        {/* Question Title with Filter Button */}
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-lg font-medium'>
                              {question.title}
                            </h3>
                            {!selectedQuestionId && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => filterToQuestion(question._id)}
                                className='text-muted-foreground hover:text-foreground'
                                title={`Filter to show only "${question.title}"`}
                              >
                                <Filter className='h-3 w-3' />
                              </Button>
                            )}
                          </div>
                          {question.description && (
                            <div className='text-muted-foreground text-sm'>
                              <TiptapRenderer
                                content={
                                  question.description_html ||
                                  question.description
                                }
                              />
                            </div>
                          )}
                        </div>

                        {/* Existing Responses */}
                        {responses.length > 0 && (
                          <div className='space-y-3 pl-6'>
                            {responses.map(response => (
                              <div
                                key={response._id}
                                className='space-y-2 border-l-2 border-gray-200 pl-4'
                              >
                                <div className='flex items-center justify-between'>
                                  <span className='text-muted-foreground text-xs'>
                                    {format(
                                      new Date(response.created_at),
                                      'MMM d, h:mm a'
                                    )}
                                  </span>
                                  <div className='flex gap-1'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        setEditingResponseId(response._id)
                                      }
                                      disabled={
                                        editingResponseId === response._id
                                      }
                                    >
                                      <Edit className='h-3 w-3' />
                                    </Button>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        handleDeleteResponse(response._id)
                                      }
                                    >
                                      <Trash2 className='h-3 w-3' />
                                    </Button>
                                  </div>
                                </div>

                                {editingResponseId === response._id ? (
                                  <div className='space-y-2'>
                                    <TiptapEditor
                                      content={
                                        response.response_json ||
                                        response.response
                                      }
                                      onUpdate={() => {
                                        // Content is managed by TipTap, we'll save on button click
                                      }}
                                      placeholder='Edit your response...'
                                      editable={true}
                                      minHeight='100px'
                                    />
                                    <div className='flex gap-2'>
                                      <Button
                                        size='sm'
                                        onClick={async () => {
                                          // Get content from the editor
                                          const editorElement =
                                            document.querySelector(
                                              '[data-response-id="' +
                                                response._id +
                                                '"] .ProseMirror'
                                            )
                                          if (editorElement) {
                                            const content =
                                              editorElement.textContent || ''
                                            const html =
                                              editorElement.innerHTML || ''
                                            await handleUpdateResponse(
                                              response._id,
                                              content,
                                              html,
                                              ''
                                            )
                                          }
                                        }}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          setEditingResponseId(null)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='prose prose-sm max-w-none'>
                                    <TiptapRenderer
                                      content={
                                        response.response_html ||
                                        response.response
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Response for Current Week */}
                        {week.isCurrentWeek && (
                          <div className='space-y-3 pl-6'>
                            {/* Show add button or editor */}
                            {!newResponseContent[newResponseKey] ? (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  updateNewResponseContent(
                                    newResponseKey,
                                    '',
                                    '',
                                    ''
                                  )
                                }
                                className='text-muted-foreground'
                              >
                                <Plus className='mr-2 h-3 w-3' />
                                Add update for this week
                              </Button>
                            ) : (
                              <div className='space-y-2 border-l-2 border-blue-200 pl-4'>
                                <div className='text-muted-foreground text-xs'>
                                  New response
                                </div>
                                <TiptapEditor
                                  content=''
                                  onUpdate={({ html, json }) => {
                                    const content =
                                      json.content?.[0]?.content?.[0]?.text ||
                                      ''
                                    updateNewResponseContent(
                                      newResponseKey,
                                      content,
                                      html,
                                      JSON.stringify(json)
                                    )
                                  }}
                                  placeholder={`Add a note about "${question.title}"...`}
                                  editable={true}
                                  minHeight='100px'
                                />
                                <div className='flex gap-2'>
                                  <Button
                                    size='sm'
                                    onClick={() =>
                                      handleCreateResponse(
                                        question._id,
                                        week.weekStartDate
                                      )
                                    }
                                    disabled={
                                      !newResponseContent[
                                        newResponseKey
                                      ]?.content.trim()
                                    }
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                      setNewResponseContent(prev => {
                                        const updated = { ...prev }
                                        delete updated[newResponseKey]
                                        return updated
                                      })
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* No responses message for current week only */}
                {week.isCurrentWeek &&
                  filteredQuestions.every(
                    q =>
                      !responsesByWeekAndQuestion[week.weekStartDate]?.[q._id]
                        ?.length
                  ) && (
                    <div className='text-muted-foreground py-4 text-center text-sm'>
                      No updates yet this week. Click &ldquo;Add update&rdquo;
                      below any question to get started.
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Reset Button */}
      {selectedQuestionId && weeksToShow.length > 0 && (
        <div className='flex justify-center border-t pt-8'>
          <Button
            variant='outline'
            onClick={resetFilter}
            className='flex items-center gap-2'
          >
            <RotateCcw className='h-4 w-4' />
            Show All Questions
          </Button>
        </div>
      )}
    </div>
  )
}
