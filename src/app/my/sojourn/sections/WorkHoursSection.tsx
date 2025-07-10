'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { WorkHourInlineForm } from '@/components/WorkHourInlineForm'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import {
  formatDateForDisplay,
  getWeekDaysInfo,
  isDateEditable,
} from '@/lib/time-functions'
import { useQuery } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../../../../convex/_generated/api'

interface WorkHoursSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  nextStep: () => void
  prevStep: () => void
}

export function WorkHoursSection({
  selectedWeek,
  nextStep,
  prevStep,
}: WorkHoursSectionProps) {
  const [editingDates, setEditingDates] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)

  // Get account settings for defaults
  const accountSettings = useAccountSettings()

  // Get work hour entries for the selected week
  const workHourEntries = useQuery(api.workHours.getWorkHoursByDateRange, {
    startDate: selectedWeek.startDate,
    endDate: selectedWeek.endDate,
  })

  // Get week days info for the selected week
  const selectedWeekStart = new Date(selectedWeek.startDate)
  const weekDaysInfo = getWeekDaysInfo(selectedWeekStart)

  // Create a map of date to work hour entry for quick lookup
  const workHourMap = new Map()
  if (workHourEntries) {
    workHourEntries.forEach(entry => {
      workHourMap.set(entry.date, entry)
    })
  }

  const handleEditDay = (dateString: string) => {
    setEditingDates(prev => new Set(prev).add(dateString))
  }

  const handleCancelEdit = (dateString: string) => {
    setEditingDates(prev => {
      const newSet = new Set(prev)
      newSet.delete(dateString)
      return newSet
    })
  }

  const handleSaveSuccess = (dateString: string) => {
    setEditingDates(prev => {
      const newSet = new Set(prev)
      newSet.delete(dateString)
      return newSet
    })
    setHasChanges(true)
    toast.success('Work hours saved successfully!')
  }

  const formatTotalHours = (hours: number, minutes: number) => {
    const total = hours + minutes / 60
    return total.toFixed(1)
  }

  const handleNext = () => {
    nextStep()
  }

  return (
    <div className='mx-auto max-w-3xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-2xl font-bold'>
          Work Hours
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>
          Let&apos;s track your work hours for the week. You can only enter data
          for current and previous days.
        </p>
        <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
          <div className='text-lg font-semibold text-blue-700 dark:text-blue-300'>
            {selectedWeek.weekRange}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        {weekDaysInfo.map(dayInfo => {
          const workHourEntry = workHourMap.get(dayInfo.dateString)
          const isEditing = editingDates.has(dayInfo.dateString)
          const canEdit = isDateEditable(dayInfo.date)

          return (
            <div
              key={dayInfo.dateString}
              className={`rounded-lg border p-4 ${
                canEdit
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 opacity-60 dark:bg-gray-700'
              }`}
            >
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='text-lg font-semibold'>{dayInfo.dayName}</div>
                  <div className='text-sm text-gray-500'>
                    {formatDateForDisplay(dayInfo.date)}
                  </div>
                  {dayInfo.isToday && (
                    <div className='rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                      Today
                    </div>
                  )}
                </div>

                {canEdit && (
                  <div className='flex items-center gap-2'>
                    {workHourEntry && !isEditing && (
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        {formatTotalHours(
                          workHourEntry.work_hours,
                          workHourEntry.work_minutes
                        )}
                        h
                      </div>
                    )}
                    {!isEditing && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEditDay(dayInfo.dateString)}
                      >
                        {workHourEntry ? 'Edit' : 'Add Hours'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {!canEdit && (
                <div className='text-sm text-gray-500 italic'>
                  Cannot edit future dates
                </div>
              )}

              {canEdit && isEditing && (
                <div className='mt-4'>
                  <WorkHourInlineForm
                    date={dayInfo.dateString}
                    existingEntry={workHourEntry}
                    defaultSettings={accountSettings || undefined}
                    onCancel={() => handleCancelEdit(dayInfo.dateString)}
                    onSuccess={() => handleSaveSuccess(dayInfo.dateString)}
                  />
                </div>
              )}

              {canEdit && !isEditing && workHourEntry && (
                <div className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <span className='font-medium'>Hours:</span>{' '}
                      {formatTotalHours(
                        workHourEntry.work_hours,
                        workHourEntry.work_minutes
                      )}
                    </div>
                    <div>
                      <span className='font-medium'>Location:</span>{' '}
                      {workHourEntry.work_location === 'home'
                        ? 'Home'
                        : workHourEntry.work_location === 'office'
                          ? 'Office'
                          : workHourEntry.work_location === 'hybrid'
                            ? 'Hybrid'
                            : workHourEntry.work_from_home
                              ? 'Home'
                              : 'Office'}
                    </div>
                  </div>
                  {workHourEntry.notes && (
                    <div className='mt-2'>
                      <span className='font-medium'>Notes:</span>{' '}
                      {workHourEntry.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasChanges && (
        <div className='text-center'>
          <div className='text-sm text-green-600 dark:text-green-400'>
            Work hours have been saved!
          </div>
        </div>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' onClick={prevStep}>
          Previous
        </Button>
        <Button onClick={handleNext}>Next: Performance Questions</Button>
      </div>
    </div>
  )
}
