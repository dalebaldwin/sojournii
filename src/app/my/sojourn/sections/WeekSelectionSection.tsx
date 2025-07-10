'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import {
  formatDateForDB,
  formatWeekRange,
  getCurrentWeek,
} from '@/lib/time-functions'
import { useState } from 'react'
import { SojournData } from '../page'

interface WeekSelectionSectionProps {
  sojournData: SojournData
  setSojournData: (data: SojournData) => void
  nextStep: () => void
}

export function WeekSelectionSection({
  sojournData,
  setSojournData,
  nextStep,
}: WeekSelectionSectionProps) {
  const [showWeekSelector, setShowWeekSelector] = useState(false)
  const userTimezone = useUserTimezone()

  // Generate previous weeks (going back 6 months)
  const generatePreviousWeeks = () => {
    const weeks = []
    const today = new Date()

    // Go back 26 weeks (about 6 months)
    for (let i = 0; i < 26; i++) {
      const weekDate = new Date(today)
      weekDate.setDate(today.getDate() - i * 7)

      const weekInfo = getCurrentWeek(weekDate, userTimezone)
      const weekOption = {
        startDate: formatDateForDB(weekInfo.startDate),
        endDate: formatDateForDB(weekInfo.endDate),
        weekRange: formatWeekRange(weekInfo.startDate, weekInfo.endDate),
        value: formatDateForDB(weekInfo.startDate),
      }
      weeks.push(weekOption)
    }

    return weeks
  }

  const previousWeeks = generatePreviousWeeks()

  const handleWeekSelect = (weekStartDate: string) => {
    const selectedWeek = previousWeeks.find(
      week => week.value === weekStartDate
    )
    if (selectedWeek) {
      setSojournData({
        ...sojournData,
        selectedWeek: {
          startDate: selectedWeek.startDate,
          endDate: selectedWeek.endDate,
          weekRange: selectedWeek.weekRange,
        },
      })
    }
    setShowWeekSelector(false)
  }

  const handleContinue = () => {
    nextStep()
  }

  return (
    <div className='mx-auto max-w-2xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-3xl font-bold'>
          Welcome to Your Weekly Sojourn
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>
          Let&apos;s capture your weekly progress and insights in one
          comprehensive session.
        </p>
      </div>

      <div className='space-y-8'>
        <div className='text-center'>
          <h2 className='mb-6 text-xl font-semibold'>Selected Week</h2>
          <div className='text-3xl font-bold'>
            {sojournData.selectedWeek.weekRange}
          </div>
          <div className='text-muted-foreground mt-2 text-sm'>
            {sojournData.selectedWeek.startDate} to{' '}
            {sojournData.selectedWeek.endDate}
          </div>
        </div>

        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            This week looks good? Or would you like to select a different week?
          </p>

          {!showWeekSelector ? (
            <Button
              variant='outline'
              onClick={() => setShowWeekSelector(true)}
              className='mr-4'
            >
              Select Different Week
            </Button>
          ) : (
            <div className='space-y-4'>
              <Select onValueChange={handleWeekSelect}>
                <SelectTrigger className='mx-auto w-full max-w-md'>
                  <SelectValue placeholder='Select a week from the past 6 months' />
                </SelectTrigger>
                <SelectContent>
                  {previousWeeks.map((week, index) => (
                    <SelectItem key={week.value} value={week.value}>
                      {week.weekRange}
                      {index === 0 && ' (Current Week)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant='outline'
                onClick={() => setShowWeekSelector(false)}
                className='ml-2'
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className='text-center'>
          <h3 className='mb-4 font-semibold'>What we&apos;ll cover:</h3>
          <ul className='text-muted-foreground space-y-2 text-sm'>
            <li>• Weekly reflection and ratings</li>
            <li>• Work hours and time tracking</li>
            <li>• Performance questions responses</li>
            <li>• Goal progress updates</li>
            <li>• Task completion</li>
          </ul>
        </div>
      </div>

      <div className='text-center'>
        <Button onClick={handleContinue} size='lg' className='px-8'>
          Continue
        </Button>
      </div>
    </div>
  )
}
