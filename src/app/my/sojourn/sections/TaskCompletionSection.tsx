'use client'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Heading } from '@/components/ui/heading'
import { useMarkTaskCompleted, useTasks, type Task } from '@/hooks/useTasks'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface TaskCompletionSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  nextStep: () => void
  prevStep: () => void
}

const statusConfig = {
  pending: { label: 'Pending', icon: Circle, color: 'text-gray-500' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-500' },
}

export function TaskCompletionSection({
  selectedWeek,
  nextStep,
  prevStep,
}: TaskCompletionSectionProps) {
  const [completionDates, setCompletionDates] = useState<Record<string, Date>>(
    {}
  )
  const [completing, setCompleting] = useState<Record<string, boolean>>({})

  // Get active tasks (pending and in_progress)
  const activeTasks = useTasks('pending')
  const inProgressTasks = useTasks('in_progress')
  const markCompleted = useMarkTaskCompleted()

  // Combine active and in-progress tasks
  const allActiveTasks = [...(activeTasks || []), ...(inProgressTasks || [])]

  const handleMarkComplete = async (
    task: Task,
    useCustomDate: boolean = false
  ) => {
    setCompleting(prev => ({ ...prev, [task._id]: true }))

    try {
      const completionDate = useCustomDate
        ? completionDates[task._id]
        : new Date()

      await markCompleted({
        id: task._id,
        completion_date: completionDate?.getTime(),
      })

      toast.success(`Task "${task.title}" marked as complete!`)
    } catch (error) {
      console.error('Failed to mark task as complete:', error)
      toast.error('Failed to mark task as complete. Please try again.')
    } finally {
      setCompleting(prev => ({ ...prev, [task._id]: false }))
    }
  }

  const handleCompletionDateChange = (
    taskId: string,
    date: Date | undefined
  ) => {
    if (date) {
      setCompletionDates(prev => ({ ...prev, [taskId]: date }))
    } else {
      setCompletionDates(prev => {
        const newDates = { ...prev }
        delete newDates[taskId]
        return newDates
      })
    }
  }

  const handleNext = () => {
    nextStep()
  }

  return (
    <div className='mx-auto max-w-3xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-2xl font-bold'>
          Task Completion
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>
          Review and complete any active tasks. You can set a specific
          completion date or use today&apos;s date.
        </p>
        <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
          <div className='text-lg font-semibold text-blue-700 dark:text-blue-300'>
            {selectedWeek.weekRange}
          </div>
        </div>
      </div>

      {allActiveTasks.length === 0 ? (
        <div className='py-8 text-center'>
          <div className='mb-4 text-4xl'>🎉</div>
          <div className='text-muted-foreground'>
            No active tasks found. You&apos;re all caught up!
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          {allActiveTasks.map(task => {
            const StatusIcon = statusConfig[task.status].icon
            const isOverdue = task.due_date && task.due_date < Date.now()
            const isCompleting = completing[task._id]
            const customDate = completionDates[task._id]

            return (
              <div
                key={task._id}
                className={`rounded-lg border p-4 transition-colors ${
                  isOverdue
                    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                    : 'border-border'
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex flex-1 items-start gap-3'>
                    <div className='mt-1'>
                      <StatusIcon
                        className={`h-5 w-5 ${statusConfig[task.status].color}`}
                      />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-medium'>{task.title}</h3>
                      {task.description && (
                        <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                          {task.description}
                        </p>
                      )}
                      <div className='mt-2 flex items-center gap-4 text-sm text-gray-500'>
                        <div className='flex items-center gap-1'>
                          <span className='font-medium'>Status:</span>
                          <span>{statusConfig[task.status].label}</span>
                        </div>
                        {task.due_date && (
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            <span>
                              Due:{' '}
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className='ml-1 font-medium text-red-500'>
                                (Overdue)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='ml-4 flex items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <DatePicker
                        date={customDate}
                        onDateChange={date =>
                          handleCompletionDateChange(task._id, date)
                        }
                        placeholder='Completion date'
                        className='w-40'
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleMarkComplete(task, !!customDate)}
                        disabled={isCompleting}
                        className='flex items-center gap-2'
                      >
                        <CheckCircle2 className='h-4 w-4' />
                        {isCompleting ? 'Completing...' : 'Complete'}
                      </Button>
                    </div>
                  </div>
                </div>

                {customDate && (
                  <div className='mt-3 border-t pt-3'>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Will be marked as completed on:{' '}
                      {customDate.toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className='text-center'>
        <div className='text-sm text-gray-600 dark:text-gray-400'>
          You can also manage tasks in more detail from the Tasks section.
        </div>
      </div>

      <div className='flex justify-between'>
        <Button variant='outline' onClick={prevStep}>
          Previous
        </Button>
        <Button onClick={handleNext} size='lg'>
          Complete Sojourn
        </Button>
      </div>
    </div>
  )
}
