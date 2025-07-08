'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import {
  useCreateRetro,
  useCurrentWeekInfo,
  useCurrentWeekRetro,
  useRetros,
} from '@/hooks/useRetros'
import { format, parseISO } from 'date-fns'
import { Calendar, Edit3, Eye, Plus, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RetroPage() {
  const router = useRouter()
  const retros = useRetros()
  const currentWeekRetro = useCurrentWeekRetro()
  const currentWeekInfo = useCurrentWeekInfo()
  const createRetro = useCreateRetro()

  const [isCreating, setIsCreating] = useState(false)

  const handleStartRetro = async () => {
    if (!currentWeekInfo || currentWeekRetro) return

    setIsCreating(true)
    try {
      const retroId = await createRetro({
        week_start_date: currentWeekInfo.startDate,
        general_feelings: 50,
        work_relationships: 50,
        professional_growth: 50,
        productivity: 50,
        personal_wellbeing: 50,
        positive_outcomes: '',
        negative_outcomes: '',
        key_takeaways: '',
      })

      // Navigate to the newly created retro in edit mode
      router.push(`/my/retro/${retroId}?edit=true`)
    } catch (error) {
      console.error('Failed to create retro:', error)
      setIsCreating(false)
    }
  }

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-6'>
      {/* Header */}
      <div className='space-y-2'>
        <Heading level='h1' weight='bold' className='mb-2' showLines>
          Weekly Retro
        </Heading>
        <p className='text-muted-foreground'>
          Reflect on your weekly performance and personal growth
        </p>
      </div>

      {/* Current Week Section */}
      {currentWeekInfo && (
        <div className='bg-muted/30 rounded-lg p-6'>
          <div className='mb-4'>
            <h2 className='text-lg font-semibold'>Current Week</h2>
            <p className='text-muted-foreground text-sm'>
              {formatWeekRange(
                currentWeekInfo.startDate,
                currentWeekInfo.endDate
              )}
            </p>
          </div>

          {currentWeekRetro ? (
            /* Show retro summary - either completed or in progress */
            <div className='space-y-4'>
              {currentWeekRetro.completed_at ? (
                /* Completed retro */
                <>
                  <div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
                    <RotateCcw className='h-5 w-5' />
                    <span className='font-medium'>Retro Completed</span>
                    <span className='text-muted-foreground text-sm'>
                      on{' '}
                      {format(
                        new Date(currentWeekRetro.completed_at),
                        'MMM d, yyyy'
                      )}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-5'>
                    <div className='bg-background rounded-lg p-3'>
                      <div className='text-muted-foreground text-sm'>
                        General Feelings
                      </div>
                      <div className='text-xl font-bold'>
                        {currentWeekRetro.general_feelings}/100
                      </div>
                    </div>
                    <div className='bg-background rounded-lg p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Work Relationships
                      </div>
                      <div className='text-xl font-bold'>
                        {currentWeekRetro.work_relationships}/100
                      </div>
                    </div>
                    <div className='bg-background rounded-lg p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Professional Growth
                      </div>
                      <div className='text-xl font-bold'>
                        {currentWeekRetro.professional_growth}/100
                      </div>
                    </div>
                    <div className='bg-background rounded-lg p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Productivity
                      </div>
                      <div className='text-xl font-bold'>
                        {currentWeekRetro.productivity}/100
                      </div>
                    </div>
                    <div className='bg-background rounded-lg p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Personal Wellbeing
                      </div>
                      <div className='text-xl font-bold'>
                        {currentWeekRetro.personal_wellbeing}/100
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Link href={`/my/retro/${currentWeekRetro._id}`}>
                      <Button
                        variant='outline'
                        className='flex items-center space-x-2'
                      >
                        <Eye className='h-4 w-4' />
                        <span>View Details</span>
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                /* Draft retro in progress */
                <>
                  <div className='flex items-center gap-2 text-orange-600 dark:text-orange-400'>
                    <RotateCcw className='h-5 w-5' />
                    <span className='font-medium'>Retro In Progress</span>
                    <span className='text-muted-foreground text-sm'>
                      started{' '}
                      {format(
                        new Date(currentWeekRetro.created_at),
                        'MMM d, yyyy'
                      )}
                    </span>
                  </div>

                  <div className='py-4 text-center'>
                    <p className='text-muted-foreground mb-4'>
                      Continue working on your weekly retro
                    </p>
                    <Link href={`/my/retro/${currentWeekRetro._id}?edit=true`}>
                      <Button className='flex items-center space-x-2'>
                        <Edit3 className='h-4 w-4' />
                        <span>Continue Retro</span>
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Show placeholder for incomplete retro */
            <div className='py-8 text-center'>
              <div className='space-y-4'>
                <div className='text-4xl'>🤔</div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold'>
                    Weekly Retro Not Completed
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Take a moment to reflect on your week and capture your
                    thoughts
                  </p>
                </div>
                <Button
                  onClick={handleStartRetro}
                  disabled={isCreating}
                  className='flex items-center space-x-2'
                >
                  <Plus className='h-4 w-4' />
                  <span>
                    {isCreating ? 'Creating...' : "Start This Week's Retro"}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Past Retros List */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Past Retros</h2>
          <div className='text-muted-foreground text-sm'>
            {retros?.filter(
              retro =>
                retro.completed_at &&
                (!currentWeekInfo ||
                  retro.week_start_date !== currentWeekInfo.startDate)
            )?.length || 0}{' '}
            retros completed
          </div>
        </div>

        {retros?.filter(
          retro =>
            retro.completed_at &&
            (!currentWeekInfo ||
              retro.week_start_date !== currentWeekInfo.startDate)
        )?.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            <div className='space-y-2'>
              <div className='text-4xl'>📝</div>
              <div>No past retros yet</div>
              <div className='text-sm'>
                Complete more weekly retros to see your history
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {retros
              ?.filter(
                retro =>
                  retro.completed_at &&
                  (!currentWeekInfo ||
                    retro.week_start_date !== currentWeekInfo.startDate)
              ) // Exclude current week retro
              ?.map(retro => (
                <div
                  key={retro._id}
                  className='hover:bg-muted/30 rounded-lg border p-4 transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3'>
                        <Calendar className='text-muted-foreground h-5 w-5' />
                        <h3 className='font-semibold'>
                          Week of{' '}
                          {formatWeekRange(
                            retro.week_start_date,
                            retro.week_end_date
                          )}
                        </h3>
                      </div>

                      <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                        <span>
                          Completed:{' '}
                          {format(new Date(retro.completed_at!), 'MMM d, yyyy')}
                        </span>
                        <span>•</span>
                        <span className='flex items-center gap-1'>
                          Avg Score:{' '}
                          {Math.round(
                            (retro.general_feelings +
                              retro.work_relationships +
                              retro.professional_growth +
                              retro.productivity +
                              retro.personal_wellbeing) /
                              5
                          )}
                          /100
                        </span>
                      </div>

                      {/* Quick preview of scores */}
                      <div className='grid grid-cols-5 gap-2'>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            General
                          </div>
                          <div className='text-sm font-medium'>
                            {retro.general_feelings}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Relationships
                          </div>
                          <div className='text-sm font-medium'>
                            {retro.work_relationships}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Growth
                          </div>
                          <div className='text-sm font-medium'>
                            {retro.professional_growth}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Productivity
                          </div>
                          <div className='text-sm font-medium'>
                            {retro.productivity}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Wellbeing
                          </div>
                          <div className='text-sm font-medium'>
                            {retro.personal_wellbeing}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Link href={`/my/retro/${retro._id}`}>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex items-center space-x-2'
                        >
                          <Eye className='h-4 w-4' />
                          <span>View</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
