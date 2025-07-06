'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Heading } from '@/components/ui/heading'
import { Label } from '@/components/ui/label'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import { getTomorrowInTimezone } from '@/lib/time-functions'
import { GoalData } from '@/lib/types'
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import { useState } from 'react'

interface GoalDateSectionProps {
  goalData: GoalData
  setGoalData: (data: GoalData) => void
  nextStep: () => void
  prevStep: () => void
}

export function GoalDateSection({
  goalData,
  setGoalData,
  nextStep,
  prevStep,
}: GoalDateSectionProps) {
  const [hasTargetDate, setHasTargetDate] = useState(!!goalData.target_date)
  const userTimezone = useUserTimezone()

  const handleDateChange = (date: Date | undefined) => {
    setGoalData({
      ...goalData,
      target_date: date,
    })
  }

  const handleTargetDateToggle = (enabled: boolean) => {
    setHasTargetDate(enabled)
    if (!enabled) {
      setGoalData({
        ...goalData,
        target_date: undefined,
      })
    }
  }

  const getMinDate = () => {
    // Use timezone-aware tomorrow calculation
    return getTomorrowInTimezone(userTimezone)
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Target Date
        </Heading>
        <p className='text-muted-foreground'>
          When would you like to achieve this goal? (Optional)
        </p>
      </div>

      <div className='space-y-6'>
        <div className='rounded-lg bg-blue-50 p-6 dark:bg-blue-950/30'>
          <div className='flex items-start gap-3'>
            <Calendar className='mt-1 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div>
              <h4 className='mb-2 font-semibold text-blue-900 dark:text-blue-100'>
                Why set a target date?
              </h4>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                Having a deadline creates urgency and helps you prioritize your
                time. However, some goals are better without strict timelines -
                it&apos;s entirely up to you!
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center space-x-3'>
            <Checkbox
              id='has-target-date'
              checked={hasTargetDate}
              onCheckedChange={handleTargetDateToggle}
            />
            <Label htmlFor='has-target-date' className='text-sm font-medium'>
              I want to set a target date for this goal
            </Label>
          </div>

          {hasTargetDate && (
            <div className='space-y-2'>
              <Label htmlFor='target-date' className='text-sm font-medium'>
                Target Date
              </Label>
              <DatePicker
                date={goalData.target_date}
                onDateChange={handleDateChange}
                placeholder='Select target date'
                minDate={getMinDate()}
                userTimezone={userTimezone}
              />
              <p className='text-muted-foreground text-sm'>
                Choose a realistic date that gives you enough time to achieve
                your goal.
              </p>
            </div>
          )}
        </div>

        {!hasTargetDate && (
          <div className='bg-muted/50 rounded-lg p-4'>
            <h4 className='mb-2 text-sm font-semibold'>No problem!</h4>
            <p className='text-muted-foreground text-sm'>
              Some goals are better achieved without time pressure. You can
              always add a target date later.
            </p>
          </div>
        )}
      </div>

      <div className='mt-8 flex justify-between gap-4'>
        <Button
          variant='outline'
          onClick={prevStep}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Button onClick={nextStep} className='flex items-center gap-2'>
          Continue
          <ArrowRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
