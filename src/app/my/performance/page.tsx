'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import {
  useCreateQuestion,
  useCreateResponse,
  useDeleteQuestion,
  useDeleteResponse,
  useDisabledQuestions,
  usePerformanceQuestions,
  usePerformanceResponses,
  useUpdateQuestion,
  useUpdateResponse,
  type PerformanceResponse,
} from '@/hooks/usePerformance'
import { format } from 'date-fns'
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Id } from '../../../../convex/_generated/dataModel'

export default function PerformancePage() {
  const questions = usePerformanceQuestions()
  const disabledQuestions = useDisabledQuestions()
  const allResponses = usePerformanceResponses()
  const createResponse = useCreateResponse()
  const updateResponse = useUpdateResponse()
  const deleteResponse = useDeleteResponse()
  const createQuestion = useCreateQuestion()
  const updateQuestion = useUpdateQuestion()
  const deleteQuestion = useDeleteQuestion()

  // UI State
  const [expandedQuestions, setExpandedQuestions] = useState<
    Set<Id<'performance_questions'>>
  >(new Set())
  const [editingQuestionId, setEditingQuestionId] =
    useState<Id<'performance_questions'> | null>(null)
  const [editingResponseId, setEditingResponseId] =
    useState<Id<'performance_responses'> | null>(null)
  const [addingNewQuestion, setAddingNewQuestion] = useState(false)
  const [newQuestionData, setNewQuestionData] = useState({
    title: '',
    description: '',
    description_html: '',
    description_json: '',
  })
  const [newResponseContent, setNewResponseContent] = useState<
    Record<string, { content: string; html: string; json: string }>
  >({})
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<{
    questionId?: Id<'performance_questions'>
    responseId?: Id<'performance_responses'>
  }>({})

  // Group responses by question
  const responsesByQuestion = useMemo(() => {
    if (!allResponses) return {}

    const grouped: Record<string, PerformanceResponse[]> = {}

    allResponses.forEach(response => {
      if (!grouped[response.question_id]) {
        grouped[response.question_id] = []
      }
      grouped[response.question_id].push(response)
    })

    // Sort responses within each group by creation date (newest first)
    Object.keys(grouped).forEach(questionId => {
      grouped[questionId].sort((a, b) => b.created_at - a.created_at)
    })

    return grouped
  }, [allResponses])

  // Get the most recent response for each question
  const getLatestResponse = (questionId: Id<'performance_questions'>) => {
    const responses = responsesByQuestion[questionId]
    return responses && responses.length > 0 ? responses[0] : null
  }

  const toggleQuestion = (questionId: Id<'performance_questions'>) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const handleCreateQuestion = async () => {
    if (!newQuestionData.title.trim()) return

    try {
      await createQuestion({
        title: newQuestionData.title,
        description: newQuestionData.description,
        description_html: newQuestionData.description_html,
        description_json: newQuestionData.description_json,
      })

      setNewQuestionData({
        title: '',
        description: '',
        description_html: '',
        description_json: '',
      })
      setAddingNewQuestion(false)
      toast.success('Question created successfully')
    } catch (error) {
      console.error('Failed to create question:', error)
      toast.error('Failed to create question')
    }
  }

  const handleUpdateQuestion = async (
    questionId: Id<'performance_questions'>,
    title: string,
    description: string,
    description_html: string,
    description_json: string
  ) => {
    try {
      await updateQuestion({
        id: questionId,
        title,
        description,
        description_html,
        description_json,
      })

      setEditingQuestionId(null)
      toast.success('Question updated successfully')
    } catch (error) {
      console.error('Failed to update question:', error)
      toast.error('Failed to update question')
    }
  }

  const handleCreateResponse = async (
    questionId: Id<'performance_questions'>
  ) => {
    const content = newResponseContent[questionId]

    if (!content || !content.content.trim()) return

    try {
      await createResponse({
        questionId,
        response: content.content,
        response_html: content.html,
        response_json: content.json,
      })

      // Clear the content
      setNewResponseContent(prev => {
        const updated = { ...prev }
        delete updated[questionId]
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

  const updateNewResponseContent = (
    questionId: Id<'performance_questions'>,
    content: string,
    html: string,
    json: string
  ) => {
    setNewResponseContent(prev => ({
      ...prev,
      [questionId]: { content, html, json },
    }))
  }

  const handleReEnableQuestion = async (
    questionId: Id<'performance_questions'>
  ) => {
    try {
      await updateQuestion({
        id: questionId,
        is_active: true,
      })
      toast.success('Question re-enabled successfully')
    } catch (error) {
      console.error('Failed to re-enable question:', error)
      toast.error('Failed to re-enable question')
    }
  }

  if (!questions) {
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
      <PageHeader
        title='Performance Tracking'
        description='Track your progress and insights for each performance question'
      >
        {/* Add New Question Button */}
        <Button
          onClick={() => setAddingNewQuestion(true)}
          disabled={addingNewQuestion}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add New Question
        </Button>
      </PageHeader>

      {/* Add New Question Form */}
      {addingNewQuestion && (
        <div className='space-y-4 rounded-lg border bg-blue-50 p-6'>
          <h3 className='font-medium'>Add New Performance Question</h3>
          <div className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Question Title
              </label>
              <Input
                type='text'
                value={newQuestionData.title}
                onChange={e =>
                  setNewQuestionData(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder='Enter question title...'
                className='w-full'
              />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Description (optional)
              </label>
              <TiptapEditor
                content=''
                onUpdate={({ html, json }) => {
                  const content = json.content?.[0]?.content?.[0]?.text || ''
                  setNewQuestionData(prev => ({
                    ...prev,
                    description: content,
                    description_html: html,
                    description_json: JSON.stringify(json),
                  }))
                }}
                placeholder='Add a description for this question...'
                editable={true}
                minHeight='100px'
              />
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={handleCreateQuestion}
                disabled={!newQuestionData.title.trim()}
              >
                Create Question
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setAddingNewQuestion(false)
                  setNewQuestionData({
                    title: '',
                    description: '',
                    description_html: '',
                    description_json: '',
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <div className='space-y-4'>
          {questions
            .filter(q => q.is_active)
            .map(question => {
              const responses = responsesByQuestion[question._id] || []
              const latestResponse = getLatestResponse(question._id)
              const isExpanded = expandedQuestions.has(question._id)
              const isEditing = editingQuestionId === question._id

              return (
                <div
                  key={question._id}
                  className='overflow-hidden rounded-lg border'
                >
                  <div className='bg-gray-50 p-4'>
                    {isEditing ? (
                      <div className='space-y-4'>
                        <div>
                          <label className='mb-2 block text-sm font-medium'>
                            Question Title
                          </label>
                          <Input
                            type='text'
                            defaultValue={question.title}
                            id={`edit-title-${question._id}`}
                            className='w-full'
                          />
                        </div>
                        <div>
                          <label className='mb-2 block text-sm font-medium'>
                            Description (optional)
                          </label>
                          <TiptapEditor
                            content={
                              question.description_json || question.description
                            }
                            onUpdate={() => {
                              // Content is managed by TipTap, we'll save on button click
                            }}
                            placeholder='Add a description for this question...'
                            editable={true}
                            minHeight='100px'
                          />
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            onClick={async () => {
                              const titleElement = document.getElementById(
                                `edit-title-${question._id}`
                              ) as HTMLInputElement
                              const editorElement = document.querySelector(
                                `[data-question-id="${question._id}"] .ProseMirror`
                              )

                              if (titleElement && editorElement) {
                                const title = titleElement.value
                                const description =
                                  editorElement.textContent || ''
                                const html = editorElement.innerHTML || ''

                                await handleUpdateQuestion(
                                  question._id,
                                  title,
                                  description,
                                  html,
                                  ''
                                )
                              }
                            }}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant='outline'
                            onClick={() => setEditingQuestionId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='flex items-start justify-between'>
                          <button
                            onClick={() => toggleQuestion(question._id)}
                            className='flex flex-1 items-start gap-3 text-left'
                          >
                            {isExpanded ? (
                              <ChevronDown className='mt-1 h-5 w-5 text-gray-400' />
                            ) : (
                              <ChevronRight className='mt-1 h-5 w-5 text-gray-400' />
                            )}

                            <div className='flex-1'>
                              <h3 className='text-lg font-medium'>
                                {question.title}
                              </h3>
                              <div className='text-muted-foreground mt-1 flex items-center gap-4 text-sm'>
                                <div className='flex items-center gap-1'>
                                  <Calendar className='h-3 w-3' />
                                  Added{' '}
                                  {format(
                                    new Date(question.created_at),
                                    'MMM d, yyyy'
                                  )}
                                </div>
                                {latestResponse && (
                                  <div className='flex items-center gap-1'>
                                    <Clock className='h-3 w-3' />
                                    Last updated{' '}
                                    {format(
                                      new Date(latestResponse.created_at),
                                      'MMM d, yyyy'
                                    )}
                                  </div>
                                )}
                                <span className='text-gray-600'>
                                  {responses.length}{' '}
                                  {responses.length === 1
                                    ? 'update'
                                    : 'updates'}
                                </span>
                              </div>
                            </div>
                          </button>

                          <div className='ml-4 flex gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setEditingQuestionId(question._id)}
                            >
                              <Edit className='h-3 w-3' />
                            </Button>
                            <Popover
                              open={
                                deletePopoverOpen.questionId === question._id
                              }
                              onOpenChange={open => {
                                setDeletePopoverOpen(prev => ({
                                  ...prev,
                                  questionId: open ? question._id : undefined,
                                }))
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <Trash2 className='h-3 w-3' />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-80'
                                side='bottom'
                                align='end'
                                sideOffset={4}
                              >
                                <div className='space-y-4'>
                                  <h3 className='font-medium'>
                                    Delete Question
                                  </h3>
                                  <p className='text-muted-foreground'>
                                    {(() => {
                                      const hasResponses = responses.length > 0
                                      return hasResponses
                                        ? `This question has ${responses.length} response${responses.length === 1 ? '' : 's'}. Deleting it will disable the question and preserve all responses. This action cannot be undone.`
                                        : 'Are you sure you want to delete this question? This action cannot be undone.'
                                    })()}
                                  </p>
                                  <div className='flex justify-end gap-2'>
                                    <Button
                                      variant='outline'
                                      onClick={() =>
                                        setDeletePopoverOpen(prev => ({
                                          ...prev,
                                          questionId: undefined,
                                        }))
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant='destructive'
                                      onClick={async () => {
                                        setDeletePopoverOpen(prev => ({
                                          ...prev,
                                          questionId: undefined,
                                        }))
                                        try {
                                          const result = await deleteQuestion({
                                            id: question._id,
                                          })
                                          if (result.type === 'soft_delete') {
                                            toast.success(
                                              `Question disabled and moved to archived questions. ${result.responseCount} response${result.responseCount === 1 ? '' : 's'} preserved.`
                                            )
                                          } else {
                                            toast.success(
                                              'Question deleted successfully'
                                            )
                                          }
                                        } catch (error) {
                                          console.error(
                                            'Failed to delete question:',
                                            error
                                          )
                                          toast.error(
                                            'Failed to delete question'
                                          )
                                        }
                                      }}
                                    >
                                      Delete Question
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {question.description && (
                          <div className='text-muted-foreground mt-3 pl-8 text-sm'>
                            <TiptapRenderer
                              content={
                                question.description_html ||
                                question.description
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Question Content (Accordion Body) */}
                  {isExpanded && !isEditing && (
                    <div className='space-y-6 p-6'>
                      {/* Add New Response */}
                      <div className='space-y-4'>
                        <h4 className='font-medium'>Add New Update</h4>
                        {!newResponseContent[question._id] ? (
                          <Button
                            variant='outline'
                            onClick={() =>
                              updateNewResponseContent(question._id, '', '', '')
                            }
                          >
                            <Plus className='mr-2 h-4 w-4' />
                            Add Update
                          </Button>
                        ) : (
                          <div className='space-y-3 rounded-lg border bg-blue-50 p-4'>
                            <TiptapEditor
                              content=''
                              onUpdate={({ html, json }) => {
                                const content =
                                  json.content?.[0]?.content?.[0]?.text || ''
                                updateNewResponseContent(
                                  question._id,
                                  content,
                                  html,
                                  JSON.stringify(json)
                                )
                              }}
                              placeholder={`Add an update for &ldquo;${question.title}&rdquo;...`}
                              editable={true}
                              minHeight='100px'
                            />
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                onClick={() =>
                                  handleCreateResponse(question._id)
                                }
                                disabled={
                                  !newResponseContent[
                                    question._id
                                  ]?.content.trim()
                                }
                              >
                                Save Update
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  setNewResponseContent(prev => {
                                    const updated = { ...prev }
                                    delete updated[question._id]
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

                      {/* Existing Responses */}
                      {responses.length > 0 && (
                        <div className='space-y-4'>
                          <Separator />
                          <h4 className='font-medium'>
                            Previous Updates ({responses.length})
                          </h4>

                          <div className='space-y-4'>
                            {responses.map(response => (
                              <div
                                key={response._id}
                                className='rounded-lg border p-4'
                              >
                                <div className='mb-3 flex items-center justify-between'>
                                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                    <Calendar className='h-3 w-3' />
                                    {format(
                                      new Date(response.created_at),
                                      'EEEE, MMM d, yyyy • h:mm a'
                                    )}
                                    <span className='rounded bg-gray-100 px-2 py-1 text-xs'>
                                      Week of{' '}
                                      {format(
                                        new Date(response.week_start_date),
                                        'MMM d'
                                      )}
                                    </span>
                                  </div>
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
                                    <Popover
                                      open={
                                        deletePopoverOpen.responseId ===
                                        response._id
                                      }
                                      onOpenChange={open => {
                                        setDeletePopoverOpen(prev => ({
                                          ...prev,
                                          responseId: open
                                            ? response._id
                                            : undefined,
                                        }))
                                      }}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button variant='ghost' size='sm'>
                                          <Trash2 className='h-3 w-3' />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className='w-80'
                                        side='bottom'
                                        align='end'
                                        sideOffset={4}
                                      >
                                        <div className='space-y-4'>
                                          <h3 className='font-medium'>
                                            Delete Response
                                          </h3>
                                          <p className='text-muted-foreground'>
                                            Are you sure you want to delete this
                                            response? This action cannot be
                                            undone.
                                          </p>
                                          <div className='flex justify-end gap-2'>
                                            <Button
                                              variant='outline'
                                              onClick={() =>
                                                setDeletePopoverOpen(prev => ({
                                                  ...prev,
                                                  responseId: undefined,
                                                }))
                                              }
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              variant='destructive'
                                              onClick={async () => {
                                                setDeletePopoverOpen(prev => ({
                                                  ...prev,
                                                  responseId: undefined,
                                                }))
                                                try {
                                                  await deleteResponse({
                                                    id: response._id,
                                                  })
                                                  toast.success(
                                                    'Response deleted successfully'
                                                  )
                                                } catch (error) {
                                                  console.error(
                                                    'Failed to delete response:',
                                                    error
                                                  )
                                                  toast.error(
                                                    'Failed to delete response'
                                                  )
                                                }
                                              }}
                                            >
                                              Delete Response
                                            </Button>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>

                                {editingResponseId === response._id ? (
                                  <div className='space-y-3'>
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
                                          const editorElement =
                                            document.querySelector(
                                              `[data-response-id="${response._id}"] .ProseMirror`
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
                        </div>
                      )}

                      {responses.length === 0 &&
                        !newResponseContent[question._id] && (
                          <div className='text-muted-foreground py-6 text-center'>
                            <p>No updates yet for this question.</p>
                            <p className='text-sm'>
                              Click &ldquo;Add Update&rdquo; to get started.
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* Disabled Questions Accordion */}
      {disabledQuestions && disabledQuestions.length > 0 && (
        <div className='space-y-4 pt-8'>
          <Separator />
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='disabled-questions'>
              <AccordionTrigger className='text-left'>
                <div>
                  <h2 className='text-lg font-medium'>
                    Archived Questions ({disabledQuestions.length})
                  </h2>
                  <p className='text-muted-foreground text-sm'>
                    Questions that have been disabled but contain historical
                    responses
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='space-y-4 pt-4'>
                  {disabledQuestions.map(question => {
                    const responses = responsesByQuestion[question._id] || []
                    const latestResponse = getLatestResponse(question._id)

                    return (
                      <div
                        key={question._id}
                        className='overflow-hidden rounded-lg border border-gray-200 bg-gray-50'
                      >
                        <div className='p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <h3 className='text-lg font-medium text-gray-700'>
                                {question.title}
                              </h3>
                              <div className='text-muted-foreground mt-1 flex items-center gap-4 text-sm'>
                                <div className='flex items-center gap-1'>
                                  <Calendar className='h-3 w-3' />
                                  Added{' '}
                                  {format(
                                    new Date(question.created_at),
                                    'MMM d, yyyy'
                                  )}
                                </div>
                                {latestResponse && (
                                  <div className='flex items-center gap-1'>
                                    <Clock className='h-3 w-3' />
                                    Last updated{' '}
                                    {format(
                                      new Date(latestResponse.created_at),
                                      'MMM d, yyyy'
                                    )}
                                  </div>
                                )}
                                <span className='text-gray-600'>
                                  {responses.length}{' '}
                                  {responses.length === 1
                                    ? 'update'
                                    : 'updates'}{' '}
                                  preserved
                                </span>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleReEnableQuestion(question._id)
                                }
                              >
                                <RotateCcw className='mr-1 h-3 w-3' />
                                Re-enable
                              </Button>
                              <span className='rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600'>
                                Archived
                              </span>
                            </div>
                          </div>

                          {question.description && (
                            <div className='text-muted-foreground mt-3 text-sm'>
                              <TiptapRenderer
                                content={
                                  question.description_html ||
                                  question.description
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}
