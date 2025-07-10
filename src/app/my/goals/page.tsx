'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import { useUserGoals, useUserMilestones } from '@/hooks/useGoals'
import { formatTimestampInTimezone } from '@/lib/time-functions'
import { Goal } from '@/lib/types'
import { useUser } from '@clerk/nextjs'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Target,
} from 'lucide-react'
import Link from 'next/link'

interface Milestone {
  _id: string
  goal_id: string
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

export default function GoalsPage() {
  const { user, isLoaded } = useUser()
  const goals = useUserGoals()
  const userTimezone = useUserTimezone()
  const milestones = useUserMilestones()

  if (!isLoaded || !user) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  if (goals === undefined || milestones === undefined) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading goals...
      </div>
    )
  }

  const activeGoals =
    goals?.filter((goal: Goal) => goal.status === 'active') || []
  const completedGoals =
    goals?.filter((goal: Goal) => goal.status === 'completed') || []

  // Sort goals by target date (earliest first), with goals without target dates at the end
  const sortGoalsByTargetDate = (goals: Goal[]) => {
    return goals.sort((a, b) => {
      // If both have target dates, sort by date (earliest first)
      if (a.target_date && b.target_date) {
        return a.target_date - b.target_date
      }
      // If only one has a target date, prioritize it
      if (a.target_date && !b.target_date) {
        return -1
      }
      if (!a.target_date && b.target_date) {
        return 1
      }
      // If neither has target date, sort by creation date (newest first)
      return b.created_at - a.created_at
    })
  }

  const sortedActiveGoals = sortGoalsByTargetDate([...activeGoals])
  const sortedCompletedGoals = sortGoalsByTargetDate([...completedGoals])

  // Calculate dashboard stats
  const now = Date.now()

  const overdueGoals =
    goals?.filter(
      g => g.target_date && g.target_date < now && g.status === 'active'
    ) || []

  const activeMilestones =
    milestones?.filter(
      m => m.status === 'pending' || m.status === 'in_progress'
    ) || []

  const completedMilestones =
    milestones?.filter(m => m.status === 'completed') || []

  // Group milestones by goal
  const milestonesByGoal =
    milestones?.reduce(
      (acc, milestone) => {
        const goalId = milestone.goal_id
        if (!acc[goalId]) {
          acc[goalId] = []
        }
        acc[goalId].push(milestone)
        return acc
      },
      {} as Record<string, Milestone[]>
    ) || {}

  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-6xl p-6'>
        {/* Header */}
        <div className='mb-8'>
          <Heading level='h1' weight='bold' className='mb-2' showLines>
            Goals Dashboard
          </Heading>
          <p className='text-muted-foreground'>
            Track your progress and achieve your aspirations
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className='mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
          <div className='bg-muted/50 rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span className='text-sm font-medium'>Completed Goals</span>
            </div>
            <div className='mt-2 text-2xl font-bold'>
              {completedGoals.length}
            </div>
          </div>

          <div className='bg-muted/50 rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <Target className='h-5 w-5 text-blue-600' />
              <span className='text-sm font-medium'>Active Goals</span>
            </div>
            <div className='mt-2 text-2xl font-bold'>{activeGoals.length}</div>
          </div>

          <div className='bg-muted/50 rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-600' />
              <span className='text-sm font-medium'>Overdue Goals</span>
            </div>
            <div className='mt-2 text-2xl font-bold'>{overdueGoals.length}</div>
          </div>

          <div className='bg-muted/50 rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span className='text-sm font-medium'>Completed Milestones</span>
            </div>
            <div className='mt-2 text-2xl font-bold'>
              {completedMilestones.length}
            </div>
          </div>

          <div className='bg-muted/50 rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <Circle className='h-5 w-5 text-orange-600' />
              <span className='text-sm font-medium'>Active Milestones</span>
            </div>
            <div className='mt-2 text-2xl font-bold'>
              {activeMilestones.length}
            </div>
          </div>
        </div>

        {/* Create New Goal Button - only show if user has goals */}
        {goals && goals.length > 0 && (
          <div className='mb-8 flex justify-center'>
            <Link href='/my/goals/guided'>
              <Button size='lg' className='h-12 px-6'>
                <Plus className='mr-2 h-5 w-5' />
                Create New Goal
              </Button>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {(!goals || goals.length === 0) && (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <Target className='text-muted-foreground mb-6 h-16 w-16' />
            <Heading level='h2' weight='normal' className='mb-4'>
              No goals yet
            </Heading>
            <p className='text-muted-foreground mb-8 max-w-md'>
              Start your journey by creating your first goal. Our guided process
              will help you break it down into achievable milestones.
            </p>
            <Link href='/my/goals/guided'>
              <Button size='lg' className='h-12 px-6'>
                <Plus className='mr-2 h-5 w-5' />
                Create Your First Goal
              </Button>
            </Link>
          </div>
        )}

        {/* Goals List */}
        {goals && goals.length > 0 && (
          <div className='space-y-6'>
            {/* Active Goals */}
            {sortedActiveGoals.length > 0 && (
              <div>
                <Heading level='h2' weight='bold' className='mb-4'>
                  Active Goals
                </Heading>
                <div className='space-y-4'>
                  {sortedActiveGoals.map((goal: Goal, index: number) => (
                    <div key={goal._id}>
                      <GoalItem
                        goal={goal}
                        userTimezone={userTimezone}
                        milestones={milestonesByGoal[goal._id] || []}
                      />
                      {index < sortedActiveGoals.length - 1 && (
                        <Separator className='my-4' />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separator between active and completed */}
            {sortedActiveGoals.length > 0 &&
              sortedCompletedGoals.length > 0 && <Separator className='my-8' />}

            {/* Completed Goals */}
            {sortedCompletedGoals.length > 0 && (
              <div>
                <Heading level='h2' weight='bold' className='mb-4'>
                  Completed Goals
                </Heading>
                <div className='space-y-4'>
                  {sortedCompletedGoals.map((goal: Goal, index: number) => (
                    <div key={goal._id}>
                      <GoalItem
                        goal={goal}
                        userTimezone={userTimezone}
                        milestones={milestonesByGoal[goal._id] || []}
                      />
                      {index < sortedCompletedGoals.length - 1 && (
                        <Separator className='my-4' />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface GoalItemProps {
  goal: Goal
  userTimezone: string
  milestones: Milestone[]
}

function GoalItem({ goal, userTimezone, milestones }: GoalItemProps) {
  const isCompleted = goal.status === 'completed'
  const now = Date.now()
  const isOverdue = goal.target_date && goal.target_date < now && !isCompleted

  return (
    <div className='py-6'>
      {/* Goal Header */}
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-2'>
            <Heading level='h3' weight='bold' className='text-xl'>
              {goal.name}
            </Heading>
          </div>

          {/* Description */}
          <div className='mb-4'>
            <TiptapRenderer
              content={goal.description_html}
              fallback={goal.description}
              className='text-muted-foreground'
            />
          </div>

          {/* Goal Meta */}
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
              {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
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

        <Button variant='outline' size='sm' asChild>
          <Link href={`/my/goals/${goal._id}`}>View Details</Link>
        </Button>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className='bg-muted/30 rounded-lg p-4'>
          <h4 className='mb-3 text-sm font-semibold'>Milestones</h4>
          <div className='space-y-2'>
            {milestones
              .sort((a, b) => a.order - b.order)
              .map(milestone => {
                const isMilestoneCompleted = milestone.status === 'completed'
                const isMilestoneOverdue =
                  milestone.target_date &&
                  milestone.target_date < now &&
                  !isMilestoneCompleted

                return (
                  <div key={milestone._id} className='flex items-start gap-3'>
                    <div className='mt-1.5'>
                      {isMilestoneCompleted ? (
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                      ) : (
                        <Circle className='text-muted-foreground h-4 w-4' />
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`text-sm font-medium ${isMilestoneCompleted ? 'text-muted-foreground line-through' : ''}`}
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
                      {milestone.target_date && (
                        <div className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
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
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
