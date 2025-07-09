'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import {
  useCurrentWeekInfo,
  usePerformanceQuestions,
  useWeeklyResponses,
} from '@/hooks/usePerformance'
import { format, parseISO } from 'date-fns'
import { Calendar, Edit, Eye, Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function PerformancePage() {
  const currentWeekInfo = useCurrentWeekInfo()
  const currentWeekData = useWeeklyResponses()
  const questions = usePerformanceQuestions()

  if (!currentWeekInfo || !currentWeekData || !questions) {
    return (
      <div className='mx-auto max-w-4xl p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-64 rounded bg-gray-200'></div>
          <div className='h-4 w-96 rounded bg-gray-200'></div>
          <div className='h-32 rounded bg-gray-200'></div>
        </div>
      </div>
    )
  }

  const hasCurrentWeekResponses = currentWeekData.responses.length > 0
  const currentWeekProgress =
    questions.length > 0
      ? Math.round((currentWeekData.responses.length / questions.length) * 100)
      : 0

  return (
    <div className='mx-auto max-w-4xl space-y-8 p-8'>
      {/* Header */}
      <div className='space-y-2'>
        <Heading level='h1' className='flex items-center gap-2'>
          <TrendingUp className='h-8 w-8' />
          Performance Tracking
        </Heading>
        <p className='text-muted-foreground'>
          Track your progress on performance questions week by week
        </p>
      </div>

      {/* Current Week Section */}
      <div className='space-y-4'>
        <Heading level='h2' className='text-xl'>
          Current Week
        </Heading>

        {questions.length === 0 ? (
          <div className='space-y-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center'>
            <TrendingUp className='mx-auto h-12 w-12 text-gray-400' />
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>
                No Performance Questions Set Up
              </h3>
              <p className='text-muted-foreground'>
                You need to set up performance questions in your settings before
                you can track your progress.
              </p>
            </div>
            <Button asChild>
              <Link href='/my/settings'>
                <Plus className='mr-2 h-4 w-4' />
                Set Up Questions
              </Link>
            </Button>
          </div>
        ) : (
          <div className='space-y-4 rounded-lg border p-6'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h3 className='font-medium'>
                  Week of {format(parseISO(currentWeekInfo.startDate), 'MMM d')}{' '}
                  - {format(parseISO(currentWeekInfo.endDate), 'MMM d, yyyy')}
                </h3>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Calendar className='h-4 w-4' />
                  <span>
                    {currentWeekData.responses.length} of {questions.length}{' '}
                    questions answered ({currentWeekProgress}%)
                  </span>
                </div>
              </div>
              <div className='flex gap-2'>
                {hasCurrentWeekResponses ? (
                  <>
                    <Button variant='outline' size='sm' asChild>
                      <Link
                        href={`/my/performance/week/${currentWeekInfo.startDate}?mode=view`}
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        View
                      </Link>
                    </Button>
                    <Button size='sm' asChild>
                      <Link
                        href={`/my/performance/week/${currentWeekInfo.startDate}?mode=edit`}
                      >
                        <Edit className='mr-2 h-4 w-4' />
                        Continue
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button size='sm' asChild>
                    <Link
                      href={`/my/performance/week/${currentWeekInfo.startDate}?mode=edit`}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Start This Week
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className='h-2 w-full rounded-full bg-gray-200'>
              <div
                className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                style={{ width: `${currentWeekProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Past Weeks Section */}
      {questions.length > 0 && (
        <div className='space-y-4'>
          <Heading level='h2' className='text-xl'>
            Past Weeks
          </Heading>

          <div className='text-muted-foreground py-8 text-center'>
            <TrendingUp className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p>
              Previous weeks will appear here once you complete more performance
              tracking.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
