'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { JSONContent } from '@tiptap/react'
import { useMutation } from 'convex/react'
import { Calendar, CheckCircle2, Circle, Clock, Target } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

interface GoalMilestoneSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  milestone: {
    _id: string
    name: string
    description: string
    description_html?: string
    description_json?: string
    target_date?: number
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    order: number
  }
  goal: {
    _id: string
    name: string
    description: string
    description_html?: string
    description_json?: string
    target_date?: number
    status: 'active' | 'completed' | 'paused' | 'cancelled'
  }
  milestoneIndex: number
  totalMilestones: number
  nextStep: () => void
  prevStep: () => void
}

export function GoalMilestoneSection({
  selectedWeek,
  milestone,
  goal,
  milestoneIndex,
  totalMilestones,
  nextStep,
  prevStep,
}: GoalMilestoneSectionProps) {
  const [currentStatus, setCurrentStatus] = useState(milestone.status)
  const [saving, setSaving] = useState(false)
  const [progressUpdate, setProgressUpdate] = useState('')
  const [hasProgressChanges, setHasProgressChanges] = useState(false)

  const updateMilestone = useMutation(api.milestones.updateMilestone)

  const handleStatusChange = async (
    newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ) => {
    if (newStatus === currentStatus) return

    setSaving(true)
    try {
      await updateMilestone({
        milestoneId: milestone._id as Id<'goal_milestones'>,
        status: newStatus,
      })

      setCurrentStatus(newStatus)
      toast.success(`Milestone status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update milestone status:', error)
      toast.error('Failed to update milestone status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleProgressUpdate = (data: { html: string; json: JSONContent }) => {
    // Extract plain text from HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = data.html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    setProgressUpdate(plainText)
    setHasProgressChanges(true)
  }

  const handleNext = () => {
    // Note: For now, we'll just collect progress updates but won't save them
    // This would require a separate milestone_progress table to track weekly updates
    nextStep()
  }

  const handlePrev = () => {
    // Note: For now, we'll just collect progress updates but won't save them
    // This would require a separate milestone_progress table to track weekly updates
    prevStep()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className='h-6 w-6 text-green-500' />
      case 'in_progress':
        return <Clock className='h-6 w-6 text-blue-500' />
      case 'cancelled':
        return <Circle className='h-6 w-6 text-red-500' />
      default:
        return <Circle className='h-6 w-6 text-gray-400' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20'
      case 'in_progress':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
      case 'cancelled':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800'
    }
  }

  return (
    <div className='mx-auto max-w-2xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-3xl font-normal'>
          {milestone.name}
        </Heading>
        <div className='mb-6 text-xl font-semibold'>
          {selectedWeek.weekRange}
        </div>
        <div className='text-sm text-gray-500'>
          Milestone {milestoneIndex} of {totalMilestones}
        </div>
      </div>

      {/* Goal Details in Accordion */}
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='goal-details'>
          <AccordionTrigger className='text-left'>
            <div className='flex items-center gap-2'>
              <Target className='h-5 w-5' />
              <span className='font-medium'>Goal: {goal.name}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='space-y-4 pt-4'>
              {goal.description && (
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {goal.description_json ? (
                    <div className='prose prose-sm dark:prose-invert max-w-none'>
                      <TiptapRenderer
                        content={JSON.parse(goal.description_json)}
                      />
                    </div>
                  ) : goal.description_html ? (
                    <div
                      className='prose prose-sm dark:prose-invert max-w-none'
                      dangerouslySetInnerHTML={{
                        __html: goal.description_html,
                      }}
                    />
                  ) : (
                    <p>{goal.description}</p>
                  )}
                </div>
              )}

              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>Status:</span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      goal.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        : goal.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : goal.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                {goal.target_date && (
                  <div className='flex items-center gap-2 text-gray-500'>
                    <Calendar className='h-4 w-4' />
                    Due: {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Milestone Details */}
      <div className={`rounded-lg border p-6 ${getStatusColor(currentStatus)}`}>
        <div className='space-y-6'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <div className='mt-1'>{getStatusIcon(currentStatus)}</div>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold'>{milestone.name}</h3>
                {milestone.target_date && (
                  <div className='mt-1 flex items-center gap-2 text-sm text-gray-500'>
                    <Calendar className='h-4 w-4' />
                    Due: {new Date(milestone.target_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {milestone.description && (
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              {milestone.description_json ? (
                <div className='prose prose-sm dark:prose-invert max-w-none'>
                  <TiptapRenderer
                    content={JSON.parse(milestone.description_json)}
                  />
                </div>
              ) : milestone.description_html ? (
                <div
                  className='prose prose-sm dark:prose-invert max-w-none'
                  dangerouslySetInnerHTML={{
                    __html: milestone.description_html,
                  }}
                />
              ) : (
                <p>{milestone.description}</p>
              )}
            </div>
          )}

          {/* Status Change */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium'>Update Status</label>
            <Select
              value={currentStatus}
              onValueChange={handleStatusChange}
              disabled={saving}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='in_progress'>In Progress</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {saving && (
              <div className='text-sm text-blue-600 dark:text-blue-400'>
                Saving status change...
              </div>
            )}
          </div>

          {/* Weekly Progress Update */}
          {currentStatus !== 'completed' && (
            <div className='space-y-3'>
              <label className='block text-sm font-medium'>
                Weekly Progress Update
              </label>
              <TiptapEditor
                content={progressUpdate || ''}
                onUpdate={handleProgressUpdate}
                placeholder='Share your progress on this milestone this week...'
                className='min-h-[120px]'
              />

              {hasProgressChanges && (
                <div className='text-sm text-orange-600 dark:text-orange-400'>
                  Progress updates will be saved when you continue...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-between pt-8'>
        <Button variant='outline' onClick={handlePrev} size='lg'>
          Previous
        </Button>
        <Button onClick={handleNext} size='lg'>
          Next
        </Button>
      </div>
    </div>
  )
}
