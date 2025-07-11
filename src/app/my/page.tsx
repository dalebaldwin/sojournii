'use client'

import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/ui/dot-pattern'
import { PageHeader } from '@/components/ui/page-header'
import { WorkHoursGauge } from '@/components/ui/work-hours-gauge'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import { useUserGoals, useUserMilestones } from '@/hooks/useGoals'
import { useTasks } from '@/hooks/useTasks'
import { useWorkHoursSummary } from '@/hooks/useWorkHours'
import { cn } from '@/lib/utils'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Coffee,
  Home,
  MapPin,
  Target,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const accountSettings = useAccountSettings()
  const goals = useUserGoals()
  const milestones = useUserMilestones()
  const tasks = useTasks()

  // Get this week's work hours
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }) // Sunday
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

  const workHoursSummary = useWorkHoursSummary(weekStartStr, weekEndStr)

  // Calculate goal completion percentages
  const goalsWithProgress = goals?.map(goal => {
    const goalMilestones = milestones?.filter(m => m.goal_id === goal._id) || []
    const completedMilestones = goalMilestones.filter(
      m => m.status === 'completed'
    ).length
    const totalMilestones = goalMilestones.length
    const completionPercentage =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0

    return {
      ...goal,
      completionPercentage,
      completedMilestones,
      totalMilestones,
    }
  })

  // Group tasks by status
  const tasksByStatus = {
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
    in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    cancelled: tasks?.filter(t => t.status === 'cancelled').length || 0,
  }

  // Get tasks due today
  const todayStr = format(today, 'yyyy-MM-dd')
  const todayTasks =
    tasks?.filter(task => {
      if (!task.due_date) return false
      const taskDate = format(new Date(task.due_date), 'yyyy-MM-dd')
      return taskDate === todayStr
    }) || []

  // Get recent tasks for display
  const recentTasks = tasks?.slice(0, 5) || []

  // Calculate target hours for gauge
  const contractHours = accountSettings?.work_hours || 40
  const contractMinutes = accountSettings?.work_minutes || 0
  const weeklyTargetHours = contractHours + contractMinutes / 60

  const currentWeekHours = workHoursSummary
    ? workHoursSummary.totalHours + workHoursSummary.totalMinutes / 60
    : 0

  return (
    <OnboardingGuard>
      {!accountSettings ? (
        <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
          Loading...
        </div>
      ) : (
        <div className='container mx-auto p-6'>
          <PageHeader
            title='Dashboard'
            description='Welcome to your career hub'
            className='mb-8'
          />

          <BentoGrid className='grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {/* Work Hours - Large card */}
            <BentoCard
              name='Work Hours'
              description='Track your time and productivity'
              className='min-h-[300px] md:col-span-2'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-green-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={15}
                    height={15}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-6'>
                {workHoursSummary ? (
                  <>
                    <div className='grid grid-cols-2 gap-6'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                            <Home className='h-4 w-4' />
                            <span>WFH Hours</span>
                          </div>
                          <div className='text-2xl font-bold'>
                            {workHoursSummary.totalWFHFormattedHours}
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                            <MapPin className='h-4 w-4' />
                            <span>Office Hours</span>
                          </div>
                          <div className='text-2xl font-bold'>
                            {workHoursSummary.totalOfficeFormattedHours}
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                            <Clock className='h-4 w-4' />
                            <span>Total Hours</span>
                          </div>
                          <div className='text-2xl font-bold'>
                            {workHoursSummary.totalFormattedHours}
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                            <Coffee className='h-4 w-4' />
                            <span>Break Hours</span>
                          </div>
                          <div className='text-2xl font-bold'>
                            {workHoursSummary.totalBreakFormattedHours}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-center'>
                        <div className='text-center'>
                          <div className='mb-2 text-sm font-medium'>
                            Weekly Progress
                          </div>
                          <WorkHoursGauge
                            currentHours={
                              Math.round(currentWeekHours * 10) / 10
                            }
                            targetHours={
                              Math.round(weeklyTargetHours * 10) / 10
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className='border-t pt-4'>
                      <Link href='/my/work-hours'>
                        <Button variant='outline' size='sm' className='w-full'>
                          View Work Hours
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className='text-muted-foreground py-8 text-center'>
                    <Clock className='mx-auto mb-4 h-12 w-12 opacity-50' />
                    <p>No work hours tracked this week</p>
                    <Link href='/my/work-hours'>
                      <Button variant='outline' size='sm' className='mt-4'>
                        Track Work Hours
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </BentoCard>

            {/* Goals - Medium card */}
            <BentoCard
              name='Goals'
              description='Track your objectives and milestones'
              className='min-h-[300px]'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-orange-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={16}
                    height={16}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-4'>
                {goalsWithProgress && goalsWithProgress.length > 0 ? (
                  <>
                    <div className='space-y-3'>
                      {goalsWithProgress.slice(0, 3).map(goal => (
                        <div key={goal._id}>
                          <div className='mb-2 flex items-center justify-between'>
                            <Link href={`/my/goals/${goal._id}`}>
                              <span className='cursor-pointer text-sm font-medium hover:underline'>
                                {goal.name}
                              </span>
                            </Link>
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground text-xs'>
                                {goal.completionPercentage}%
                              </span>
                              <span
                                className={cn(
                                  'rounded-full px-2 py-1 text-xs',
                                  goal.status === 'active' &&
                                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                                  goal.status === 'completed' &&
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                                  goal.status === 'paused' &&
                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                                  goal.status === 'cancelled' &&
                                    'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                )}
                              >
                                {goal.status}
                              </span>
                            </div>
                          </div>
                          <div className='bg-muted h-2 w-full rounded-full'>
                            <div
                              className='h-2 rounded-full bg-orange-500 transition-all duration-300'
                              style={{ width: `${goal.completionPercentage}%` }}
                            />
                          </div>
                          <div className='text-muted-foreground mt-1 text-xs'>
                            {goal.completedMilestones} / {goal.totalMilestones}{' '}
                            milestones
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='border-t pt-4'>
                      <Link href='/my/goals'>
                        <Button variant='outline' size='sm' className='w-full'>
                          View All Goals
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className='text-muted-foreground py-8 text-center'>
                    <Target className='mx-auto mb-4 h-12 w-12 opacity-50' />
                    <p>No goals set yet</p>
                    <Link href='/my/goals'>
                      <Button variant='outline' size='sm' className='mt-4'>
                        Create Your First Goal
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </BentoCard>

            {/* Tasks - Large card */}
            <BentoCard
              name='Tasks'
              description='Manage your current workload'
              className='min-h-[300px] md:col-span-2'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-purple-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={18}
                    height={18}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-4'>
                {tasks && tasks.length > 0 ? (
                  <>
                    <div className='grid grid-cols-4 gap-4'>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-orange-500'>
                          {tasksByStatus.pending}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          Pending
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-blue-500'>
                          {tasksByStatus.in_progress}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          In Progress
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-green-500'>
                          {tasksByStatus.completed}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          Completed
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-500'>
                          {tasksByStatus.cancelled}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          Cancelled
                        </div>
                      </div>
                    </div>

                    <div className='border-t pt-4'>
                      <div className='mb-3 flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          Recent Tasks
                        </span>
                        {todayTasks.length > 0 && (
                          <span className='text-xs font-medium text-orange-500'>
                            {todayTasks.length} due today
                          </span>
                        )}
                      </div>
                      <div className='space-y-2'>
                        {recentTasks.map(task => {
                          const isDueToday = todayTasks.some(
                            t => t._id === task._id
                          )
                          const statusIcon =
                            task.status === 'completed'
                              ? CheckCircle2
                              : task.status === 'in_progress'
                                ? Circle
                                : task.status === 'cancelled'
                                  ? AlertCircle
                                  : Circle
                          const StatusIcon = statusIcon

                          return (
                            <div
                              key={task._id}
                              className={cn(
                                'hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors',
                                isDueToday &&
                                  'border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                              )}
                            >
                              <StatusIcon
                                className={cn(
                                  'h-4 w-4',
                                  task.status === 'completed' &&
                                    'text-green-500',
                                  task.status === 'in_progress' &&
                                    'text-blue-500',
                                  task.status === 'cancelled' &&
                                    'text-gray-500',
                                  task.status === 'pending' && 'text-orange-500'
                                )}
                              />
                              <div className='min-w-0 flex-1'>
                                <div className='truncate text-sm font-medium'>
                                  {task.title}
                                </div>
                                {task.due_date && (
                                  <div
                                    className={cn(
                                      'text-muted-foreground text-xs',
                                      isDueToday &&
                                        'font-medium text-orange-600'
                                    )}
                                  >
                                    Due:{' '}
                                    {format(new Date(task.due_date), 'MMM d')}
                                    {isDueToday && ' (Today)'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className='border-t pt-4'>
                      <Link href='/my/tasks'>
                        <Button variant='outline' size='sm' className='w-full'>
                          View All Tasks
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className='text-muted-foreground py-8 text-center'>
                    <Circle className='mx-auto mb-4 h-12 w-12 opacity-50' />
                    <p>No tasks created yet</p>
                    <Link href='/my/tasks'>
                      <Button variant='outline' size='sm' className='mt-4'>
                        Create Your First Task
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      )}
    </OnboardingGuard>
  )
}
