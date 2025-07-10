'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { useUserGoals, useUserMilestones } from '@/hooks/useGoals'
import { Goal } from '@/lib/types'
import { Calendar, CheckCircle2, Circle, Clock, Target } from 'lucide-react'
import { useState } from 'react'
import { Id } from '../../../../../convex/_generated/dataModel'

interface GoalProgressSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  nextStep: () => void
  prevStep: () => void
}

interface Milestone {
  _id: Id<'goal_milestones'>
  goal_id: Id<'goals'>
  name: string
  description: string
  description_html?: string
  description_json?: string
  target_date?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  order: number
  created_at: number
  updated_at: number
  user_id: string
}

export function GoalProgressSection({
  selectedWeek,
  nextStep,
  prevStep,
}: GoalProgressSectionProps) {
  const [progressUpdates, setProgressUpdates] = useState<
    Record<string, string>
  >({})
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({})

  // Get goals and milestones
  const goals = useUserGoals()
  const milestones = useUserMilestones()

  // Group milestones by goal
  const milestonesByGoal = new Map<string, Milestone[]>()
  if (milestones) {
    milestones.forEach(milestone => {
      const goalId = milestone.goal_id
      if (!milestonesByGoal.has(goalId)) {
        milestonesByGoal.set(goalId, [])
      }
      milestonesByGoal.get(goalId)!.push(milestone)
    })
  }

  // Sort milestones by order
  milestonesByGoal.forEach(milestones => {
    milestones.sort((a, b) => a.order - b.order)
  })

  const handleProgressUpdate = (
    milestoneId: string,
    data: { html: string; json: object }
  ) => {
    // Extract plain text from HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = data.html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    setProgressUpdates(prev => ({
      ...prev,
      [milestoneId]: plainText,
    }))

    setHasChanges(prev => ({
      ...prev,
      [milestoneId]: true,
    }))
  }

  // Note: For now, we'll just collect progress updates but won't save them
  // This would require a separate milestone_progress table to track weekly updates

  const handleNext = () => {
    nextStep()
  }

  if (!goals || !milestones) {
    return (
      <div className='space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800'>
        <div className='text-center'>
          <div className='text-muted-foreground'>Loading goals...</div>
        </div>
      </div>
    )
  }

  const activeGoals = goals.filter((goal: Goal) => goal.status === 'active')

  return (
    <div className='mx-auto max-w-3xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-2xl font-bold'>
          Goal Progress
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>
          Update your progress on active goals and milestones for this week.
        </p>
        <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
          <div className='text-lg font-semibold text-blue-700 dark:text-blue-300'>
            {selectedWeek.weekRange}
          </div>
        </div>
      </div>

      {activeGoals.length === 0 ? (
        <div className='py-8 text-center'>
          <div className='text-muted-foreground'>
            No active goals found. You can create goals in the Goals section.
          </div>
        </div>
      ) : (
        <div className='space-y-8'>
          {activeGoals.map((goal: Goal) => {
            const goalMilestones = milestonesByGoal.get(goal._id) || []
            const completedMilestones = goalMilestones.filter(
              m => m.status === 'completed'
            )
            const progressPercentage =
              goalMilestones.length > 0
                ? (completedMilestones.length / goalMilestones.length) * 100
                : 0

            return (
              <div key={goal._id} className='space-y-6 rounded-lg border p-6'>
                <div className='space-y-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='flex items-center gap-2 text-xl font-semibold'>
                        <Target className='h-5 w-5' />
                        {goal.name}
                      </h3>
                      {goal.description && (
                        <p className='text-muted-foreground mt-1 text-sm'>
                          {goal.description}
                        </p>
                      )}
                    </div>
                    {goal.target_date && (
                      <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <Calendar className='h-4 w-4' />
                        Due: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className='h-2 rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-500 transition-all duration-300'
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className='text-xs text-gray-500'>
                      {completedMilestones.length} of {goalMilestones.length}{' '}
                      milestones completed
                    </div>
                  </div>
                </div>

                {goalMilestones.length > 0 && (
                  <div className='space-y-4'>
                    <h4 className='font-semibold'>Milestones</h4>
                    {goalMilestones.map(milestone => {
                      const isCompleted = milestone.status === 'completed'
                      const isInProgress = milestone.status === 'in_progress'
                      const hasCurrentChanges = hasChanges[milestone._id]

                      return (
                        <div
                          key={milestone._id}
                          className={`rounded-lg border p-4 ${
                            isCompleted
                              ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className='flex items-start gap-3'>
                            <div className='mt-1'>
                              {isCompleted ? (
                                <CheckCircle2 className='h-5 w-5 text-green-500' />
                              ) : isInProgress ? (
                                <Clock className='h-5 w-5 text-blue-500' />
                              ) : (
                                <Circle className='h-5 w-5 text-gray-400' />
                              )}
                            </div>
                            <div className='flex-1 space-y-2'>
                              <div className='flex items-start justify-between'>
                                <div>
                                  <h5 className='font-medium'>
                                    {milestone.name}
                                  </h5>
                                  {milestone.description && (
                                    <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                                      {milestone.description}
                                    </p>
                                  )}
                                </div>
                                {milestone.target_date && (
                                  <div className='text-xs text-gray-500'>
                                    Due:{' '}
                                    {new Date(
                                      milestone.target_date
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              {!isCompleted && (
                                <div className='space-y-2'>
                                  <label className='text-sm font-medium'>
                                    Weekly Progress Update
                                  </label>
                                  <TiptapEditor
                                    content={
                                      progressUpdates[milestone._id] || ''
                                    }
                                    onUpdate={data =>
                                      handleProgressUpdate(milestone._id, data)
                                    }
                                    placeholder='Share your progress on this milestone this week...'
                                    className='min-h-[80px]'
                                  />

                                  {hasCurrentChanges && (
                                    <div className='text-sm text-orange-600 dark:text-orange-400'>
                                      Progress updates will be saved
                                      automatically...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' onClick={prevStep}>
          Previous
        </Button>
        <Button onClick={handleNext}>Next: Task Completion</Button>
      </div>
    </div>
  )
}
