'use client'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import {
  useCreateMilestone,
  useDeleteMilestone,
  useGoal,
  useGoalMilestones,
  useUpdateMilestone,
} from '@/hooks/useGoals'
import {
  convertSelectedDateToTimestamp,
  formatTimestampInTimezone,
  getTomorrowInTimezone,
  timestampToDate,
} from '@/lib/time-functions'
import { useUser } from '@clerk/nextjs'
import { JSONContent } from '@tiptap/react'
import { useMutation } from 'convex/react'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
  Plus,
  Save,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { use, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

interface GoalDetailsPageProps {
  params: Promise<{
    goalId: string
  }>
}

interface MilestoneData {
  _id?: string
  name: string
  description: string
  description_html?: string
  description_json?: string
  target_date?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  order: number
}

export default function GoalDetailsPage({ params }: GoalDetailsPageProps) {
  const { user, isLoaded } = useUser()
  const userTimezone = useUserTimezone()
  const resolvedParams = use(params)
  const goalId = resolvedParams.goalId as Id<'goals'>

  const goal = useGoal(goalId)
  const milestones = useGoalMilestones(goalId)

  const updateGoal = useMutation(api.goals.updateGoal)
  const updateMilestone = useUpdateMilestone()
  const createMilestone = useCreateMilestone()
  const deleteMilestone = useDeleteMilestone()

  const [editingGoal, setEditingGoal] = useState(false)
  const [editingMilestones, setEditingMilestones] = useState<Set<string>>(
    new Set()
  )
  const [addingMilestone, setAddingMilestone] = useState(false)

  // Goal editing state
  const [goalName, setGoalName] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [goalDescriptionHtml, setGoalDescriptionHtml] = useState('')
  const [goalDescriptionJson, setGoalDescriptionJson] = useState('')
  const [goalTargetDate, setGoalTargetDate] = useState<Date | undefined>()
  const [goalStatus, setGoalStatus] = useState<
    'active' | 'completed' | 'paused' | 'cancelled'
  >('active')

  // New milestone state
  const [newMilestone, setNewMilestone] = useState<MilestoneData>({
    name: '',
    description: '',
    description_html: '',
    description_json: '',
    target_date: undefined,
    status: 'pending',
    order: 0,
  })

  // Milestone editing state
  const [editingMilestoneData, setEditingMilestoneData] = useState<
    Record<string, MilestoneData>
  >({})

  if (!isLoaded || !user) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  if (goal === undefined || milestones === undefined) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading goal...
      </div>
    )
  }

  if (goal === null) {
    return notFound()
  }

  const initializeGoalEditing = () => {
    setGoalName(goal.name)
    setGoalDescription(goal.description)
    setGoalDescriptionHtml(goal.description_html || '')
    setGoalDescriptionJson(goal.description_json || '')
    setGoalTargetDate(
      goal.target_date ? timestampToDate(goal.target_date) : undefined
    )
    setGoalStatus(goal.status)
    setEditingGoal(true)
  }

  const initializeMilestoneEditing = (milestone: {
    _id: string
    name: string
    description: string
    description_html?: string
    description_json?: string
    target_date?: number
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    order: number
  }) => {
    setEditingMilestoneData(prev => ({
      ...prev,
      [milestone._id]: {
        _id: milestone._id,
        name: milestone.name,
        description: milestone.description,
        description_html: milestone.description_html || '',
        description_json: milestone.description_json || '',
        target_date: milestone.target_date
          ? timestampToDate(milestone.target_date)
          : undefined,
        status: milestone.status,
        order: milestone.order,
      },
    }))
    setEditingMilestones(prev => new Set([...prev, milestone._id]))
  }

  const handleSaveGoal = async () => {
    try {
      await updateGoal({
        goalId,
        name: goalName,
        description: goalDescription,
        description_html: goalDescriptionHtml,
        description_json: goalDescriptionJson,
        target_date: goalTargetDate
          ? convertSelectedDateToTimestamp(goalTargetDate, userTimezone)
          : undefined,
        status: goalStatus,
      })
      setEditingGoal(false)
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleSaveMilestone = async (milestoneId: string) => {
    try {
      const milestoneData = editingMilestoneData[milestoneId]
      await updateMilestone({
        milestoneId: milestoneId as Id<'goal_milestones'>,
        name: milestoneData.name,
        description: milestoneData.description,
        description_html: milestoneData.description_html,
        description_json: milestoneData.description_json,
        target_date: milestoneData.target_date
          ? convertSelectedDateToTimestamp(
              milestoneData.target_date,
              userTimezone
            )
          : undefined,
        status: milestoneData.status,
      })

      setEditingMilestones(prev => {
        const newSet = new Set(prev)
        newSet.delete(milestoneId)
        return newSet
      })

      setEditingMilestoneData(prev => {
        const newData = { ...prev }
        delete newData[milestoneId]
        return newData
      })
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
  }

  const handleAddMilestone = async () => {
    try {
      const nextOrder = milestones.length
      await createMilestone({
        goalId,
        name: newMilestone.name,
        description: newMilestone.description,
        description_html: newMilestone.description_html,
        description_json: newMilestone.description_json,
        target_date: newMilestone.target_date
          ? convertSelectedDateToTimestamp(
              newMilestone.target_date,
              userTimezone
            )
          : undefined,
        order: nextOrder,
      })

      setNewMilestone({
        name: '',
        description: '',
        description_html: '',
        description_json: '',
        target_date: undefined,
        status: 'pending',
        order: 0,
      })
      setAddingMilestone(false)
    } catch (error) {
      console.error('Error creating milestone:', error)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone({
        milestoneId: milestoneId as Id<'goal_milestones'>,
      })
    } catch (error) {
      console.error('Error deleting milestone:', error)
    }
  }

  const handleGoalDescriptionChange = (content: {
    html: string
    json: JSONContent
  }) => {
    setGoalDescription(content.html || '')
    setGoalDescriptionHtml(content.html)
    setGoalDescriptionJson(JSON.stringify(content.json))
  }

  const handleMilestoneDescriptionChange = (
    milestoneId: string,
    content: { html: string; json: JSONContent }
  ) => {
    setEditingMilestoneData(prev => ({
      ...prev,
      [milestoneId]: {
        ...prev[milestoneId],
        description: content.html || '',
        description_html: content.html,
        description_json: JSON.stringify(content.json),
      },
    }))
  }

  const handleNewMilestoneDescriptionChange = (content: {
    html: string
    json: JSONContent
  }) => {
    setNewMilestone(prev => ({
      ...prev,
      description: content.html || '',
      description_html: content.html,
      description_json: JSON.stringify(content.json),
    }))
  }

  const isCompleted = goal.status === 'completed'
  const now = Date.now()
  const isOverdue = goal.target_date && goal.target_date < now && !isCompleted

  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-4xl p-6'>
        {/* Header */}
        <div className='mb-8 flex items-center gap-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/my/goals'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Goals
            </Link>
          </Button>
        </div>

        {/* Goal Details */}
        <div className='mb-8'>
          {editingGoal ? (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <Heading level='h1' weight='bold'>
                  Edit Goal
                </Heading>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setEditingGoal(false)}
                  >
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveGoal}>
                    <Save className='mr-2 h-4 w-4' />
                    Save
                  </Button>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <Label htmlFor='goal-name'>Goal Name</Label>
                  <Input
                    id='goal-name'
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    placeholder='Enter goal name'
                  />
                </div>

                <div>
                  <Label htmlFor='goal-description'>Description</Label>
                  <TiptapEditor
                    content={
                      goalDescriptionJson
                        ? JSON.parse(goalDescriptionJson)
                        : goalDescription
                    }
                    onUpdate={handleGoalDescriptionChange}
                    placeholder='Describe your goal...'
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <Label htmlFor='goal-target-date'>Target Date</Label>
                    <DatePicker
                      date={goalTargetDate}
                      onDateChange={setGoalTargetDate}
                      placeholder='Select target date'
                      minDate={getTomorrowInTimezone(userTimezone)}
                      userTimezone={userTimezone}
                    />
                  </div>

                  <div>
                    <Label htmlFor='goal-status'>Status</Label>
                    <Select
                      value={goalStatus}
                      onValueChange={value =>
                        setGoalStatus(value as typeof goalStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='completed'>Completed</SelectItem>
                        <SelectItem value='paused'>Paused</SelectItem>
                        <SelectItem value='cancelled'>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex-1'>
                  <Heading level='h1' weight='bold' className='mb-2' showLines>
                    {goal.name}
                  </Heading>

                  <div className='text-muted-foreground mb-4 flex flex-wrap items-center gap-4 text-sm'>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isCompleted
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : isOverdue
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {isCompleted
                        ? 'Completed'
                        : isOverdue
                          ? 'Overdue'
                          : 'Active'}
                    </div>
                    {goal.target_date && (
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          Target:{' '}
                          {formatTimestampInTimezone(
                            goal.target_date,
                            userTimezone,
                            'MMM d, yyyy'
                          )}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center gap-1'>
                      <Target className='h-4 w-4' />
                      <span>
                        {milestones.length} milestone
                        {milestones.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant='outline' onClick={initializeGoalEditing}>
                  <Edit3 className='mr-2 h-4 w-4' />
                  Edit Goal
                </Button>
              </div>

              <div className='mb-6'>
                <TiptapRenderer
                  content={goal.description_html}
                  fallback={goal.description}
                  className='text-muted-foreground'
                />
              </div>
            </div>
          )}
        </div>

        <Separator className='my-8' />

        {/* Milestones Section */}
        <div>
          <div className='mb-6 flex items-center justify-between'>
            <Heading level='h2' weight='bold'>
              Milestones
            </Heading>
            <Button
              variant='outline'
              onClick={() => setAddingMilestone(true)}
              disabled={addingMilestone}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Milestone
            </Button>
          </div>

          {/* Add New Milestone */}
          {addingMilestone && (
            <div className='bg-muted/30 mb-6 rounded-lg border p-4'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Add New Milestone</h3>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setAddingMilestone(false)}
                  >
                    <X className='mr-1 h-4 w-4' />
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleAddMilestone}
                    disabled={!newMilestone.name.trim()}
                  >
                    <Save className='mr-1 h-4 w-4' />
                    Save
                  </Button>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <Label htmlFor='new-milestone-name'>Milestone Name</Label>
                  <Input
                    id='new-milestone-name'
                    value={newMilestone.name}
                    onChange={e =>
                      setNewMilestone(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder='Enter milestone name'
                  />
                </div>

                <div>
                  <Label htmlFor='new-milestone-description'>Description</Label>
                  <TiptapEditor
                    content={
                      newMilestone.description_json
                        ? JSON.parse(newMilestone.description_json)
                        : newMilestone.description
                    }
                    onUpdate={handleNewMilestoneDescriptionChange}
                    placeholder='Describe this milestone...'
                    minHeight='80px'
                  />
                </div>

                <div>
                  <Label htmlFor='new-milestone-target-date'>
                    Target Date (Optional)
                  </Label>
                  <DatePicker
                    date={newMilestone.target_date}
                    onDateChange={date =>
                      setNewMilestone(prev => ({ ...prev, target_date: date }))
                    }
                    placeholder='Select target date'
                    minDate={getTomorrowInTimezone(userTimezone)}
                    maxDate={
                      goal.target_date
                        ? timestampToDate(goal.target_date)
                        : undefined
                    }
                    userTimezone={userTimezone}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Existing Milestones */}
          <div className='space-y-4'>
            {milestones
              .sort((a, b) => a.order - b.order)
              .map(milestone => {
                const isEditing = editingMilestones.has(milestone._id)
                const editData = editingMilestoneData[milestone._id]
                const isMilestoneCompleted = milestone.status === 'completed'
                const isMilestoneOverdue =
                  milestone.target_date &&
                  milestone.target_date < now &&
                  !isMilestoneCompleted

                return (
                  <div
                    key={milestone._id}
                    className='bg-muted/30 rounded-lg border p-4'
                  >
                    {isEditing ? (
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-sm font-semibold'>
                            Edit Milestone
                          </h3>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setEditingMilestones(prev => {
                                  const newSet = new Set(prev)
                                  newSet.delete(milestone._id)
                                  return newSet
                                })
                                setEditingMilestoneData(prev => {
                                  const newData = { ...prev }
                                  delete newData[milestone._id]
                                  return newData
                                })
                              }}
                            >
                              <X className='mr-1 h-4 w-4' />
                              Cancel
                            </Button>
                            <Button
                              size='sm'
                              onClick={() => handleSaveMilestone(milestone._id)}
                            >
                              <Save className='mr-1 h-4 w-4' />
                              Save
                            </Button>
                          </div>
                        </div>

                        <div className='space-y-4'>
                          <div>
                            <Label>Milestone Name</Label>
                            <Input
                              value={editData?.name || ''}
                              onChange={e =>
                                setEditingMilestoneData(prev => ({
                                  ...prev,
                                  [milestone._id]: {
                                    ...prev[milestone._id],
                                    name: e.target.value,
                                  },
                                }))
                              }
                              placeholder='Enter milestone name'
                            />
                          </div>

                          <div>
                            <Label>Description</Label>
                            <TiptapEditor
                              content={
                                editData?.description_json
                                  ? JSON.parse(editData.description_json)
                                  : editData?.description || ''
                              }
                              onUpdate={content =>
                                handleMilestoneDescriptionChange(
                                  milestone._id,
                                  content
                                )
                              }
                              placeholder='Describe this milestone...'
                              minHeight='80px'
                            />
                          </div>

                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div>
                              <Label>Target Date (Optional)</Label>
                              <DatePicker
                                date={editData?.target_date}
                                onDateChange={date =>
                                  setEditingMilestoneData(prev => ({
                                    ...prev,
                                    [milestone._id]: {
                                      ...prev[milestone._id],
                                      target_date: date,
                                    },
                                  }))
                                }
                                placeholder='Select target date'
                                minDate={getTomorrowInTimezone(userTimezone)}
                                maxDate={
                                  goal.target_date
                                    ? timestampToDate(goal.target_date)
                                    : undefined
                                }
                                userTimezone={userTimezone}
                              />
                            </div>

                            <div>
                              <Label>Status</Label>
                              <Select
                                value={editData?.status}
                                onValueChange={value =>
                                  setEditingMilestoneData(prev => ({
                                    ...prev,
                                    [milestone._id]: {
                                      ...prev[milestone._id],
                                      status: value as typeof editData.status,
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='pending'>
                                    Pending
                                  </SelectItem>
                                  <SelectItem value='in_progress'>
                                    In Progress
                                  </SelectItem>
                                  <SelectItem value='completed'>
                                    Completed
                                  </SelectItem>
                                  <SelectItem value='cancelled'>
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='mb-3 flex items-start justify-between'>
                          <div className='flex flex-1 items-start gap-3'>
                            <div className='mt-1.5'>
                              {isMilestoneCompleted ? (
                                <CheckCircle2 className='h-4 w-4 text-green-600' />
                              ) : (
                                <Circle className='text-muted-foreground h-4 w-4' />
                              )}
                            </div>
                            <div className='flex-1'>
                              <div className='mb-2 flex items-center gap-2'>
                                <span
                                  className={`text-lg font-medium ${isMilestoneCompleted ? 'text-muted-foreground line-through' : ''}`}
                                >
                                  {milestone.name}
                                </span>
                                <div
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    isMilestoneCompleted
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : isMilestoneOverdue
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : milestone.status === 'in_progress'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}
                                >
                                  {milestone.status === 'completed'
                                    ? 'Completed'
                                    : milestone.status === 'in_progress'
                                      ? 'In Progress'
                                      : isMilestoneOverdue
                                        ? 'Overdue'
                                        : 'Pending'}
                                </div>
                              </div>

                              <div className='mb-2'>
                                <TiptapRenderer
                                  content={milestone.description_html}
                                  fallback={milestone.description}
                                  className='text-muted-foreground text-sm'
                                />
                              </div>

                              {milestone.target_date && (
                                <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                  <Clock className='h-3 w-3' />
                                  Due:{' '}
                                  {formatTimestampInTimezone(
                                    milestone.target_date,
                                    userTimezone,
                                    'MMM d, yyyy'
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className='flex gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                initializeMilestoneEditing(milestone)
                              }
                            >
                              <Edit3 className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleDeleteMilestone(milestone._id)
                              }
                              className='text-red-600 hover:bg-red-50 hover:text-red-700'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>

          {milestones.length === 0 && !addingMilestone && (
            <div className='py-8 text-center'>
              <Target className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <p className='text-muted-foreground'>
                No milestones yet. Add your first milestone to break down this
                goal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
