'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import { useUserGoals } from '@/hooks/useGoals'
import { formatTimestampInTimezone } from '@/lib/time-functions'
import { Goal } from '@/lib/types'
import { useUser } from '@clerk/nextjs'
import { Plus, Target } from 'lucide-react'
import Link from 'next/link'

export default function GoalsPage() {
  const { user, isLoaded } = useUser()
  const goals = useUserGoals()
  const userTimezone = useUserTimezone()

  if (!isLoaded || !user) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  if (goals === undefined) {
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

  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-4xl p-6'>
        {/* Header */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <Heading level='h1' weight='bold' className='mb-2' showLines>
              Goals
            </Heading>
            <p className='text-muted-foreground'>
              Track your progress and achieve your aspirations
            </p>
          </div>
          <Link href='/my/goals/guided'>
            <Button size='lg' className='h-12 px-6'>
              <Plus className='mr-2 h-5 w-5' />
              Create New Goal
            </Button>
          </Link>
        </div>

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

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className='mb-8'>
            <Heading level='h2' weight='bold' className='mb-4'>
              Active Goals
            </Heading>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {activeGoals.map((goal: Goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  userTimezone={userTimezone}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <Heading level='h2' weight='bold' className='mb-4'>
              Completed Goals
            </Heading>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {completedGoals.map((goal: Goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  userTimezone={userTimezone}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GoalCard({
  goal,
  userTimezone,
}: {
  goal: Goal
  userTimezone: string
}) {
  const isCompleted = goal.status === 'completed'

  return (
    <div className='border-border bg-background rounded-lg border p-6 transition-shadow hover:shadow-md'>
      <div className='mb-3 flex items-start justify-between'>
        <Heading level='h3' weight='bold' className='line-clamp-2'>
          {goal.name}
        </Heading>
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            isCompleted
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          {isCompleted ? 'Completed' : 'Active'}
        </div>
      </div>

      <p className='text-muted-foreground mb-4 line-clamp-3 text-sm'>
        {goal.description}
      </p>

      {goal.target_date && (
        <div className='text-muted-foreground mb-4 flex items-center text-sm'>
          <Target className='mr-2 h-4 w-4' />
          Target:{' '}
          {formatTimestampInTimezone(
            goal.target_date,
            userTimezone,
            'MMM d, yyyy'
          )}
        </div>
      )}

      <div className='flex gap-2'>
        <Button variant='outline' size='sm' className='flex-1' asChild>
          <Link href={`/my/goals/${goal._id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  )
}
