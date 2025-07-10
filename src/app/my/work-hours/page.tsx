'use client'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import {
  formatDateForDisplay,
  formatWeekRange,
  getCurrentWeek,
  getWeekDaysInfo,
  isDateEditable,
} from '@/lib/time-functions'
import { useQuery } from 'convex/react'
import { Edit3, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { WorkHourInlineForm } from '../../../components/WorkHourInlineForm'

interface WorkHourEntry {
  _id: string
  date: string
  work_hours: number
  work_minutes: number
  work_start_hour?: number
  work_start_minute?: number
  work_start_am_pm?: 'AM' | 'PM'
  work_end_hour?: number
  work_end_minute?: number
  work_end_am_pm?: 'AM' | 'PM'
  work_home_start_hour?: number
  work_home_start_minute?: number
  work_home_start_am_pm?: 'AM' | 'PM'
  work_home_end_hour?: number
  work_home_end_minute?: number
  work_home_end_am_pm?: 'AM' | 'PM'
  work_office_start_hour?: number
  work_office_start_minute?: number
  work_office_start_am_pm?: 'AM' | 'PM'
  work_office_end_hour?: number
  work_office_end_minute?: number
  work_office_end_am_pm?: 'AM' | 'PM'
  work_location?: 'home' | 'office' | 'hybrid'
  break_hours?: number
  break_minutes?: number
  work_from_home?: boolean
  notes?: string
}

export default function WorkHoursPage() {
  const [editingDate, setEditingDate] = useState<string | null>(null)

  // Get current week info
  const currentWeek = getCurrentWeek()
  const weekDays = getWeekDaysInfo()

  // Get account settings for defaults
  const accountSettings = useAccountSettings()

  // Get work hour entries for the current week
  const workHourEntries = useQuery(api.workHours.getWorkHoursByDateRange, {
    startDate: currentWeek.startDate.toISOString().split('T')[0],
    endDate: currentWeek.endDate.toISOString().split('T')[0],
  })

  // Create a map of date to work hour entry for quick lookup
  const workHourMap = new Map<string, WorkHourEntry>()
  if (workHourEntries) {
    workHourEntries.forEach(entry => {
      workHourMap.set(entry.date, entry as WorkHourEntry)
    })
  }

  const handleEditDay = (dateString: string) => {
    setEditingDate(dateString)
  }

  const handleCancelEdit = () => {
    setEditingDate(null)
  }

  const handleSaveSuccess = () => {
    setEditingDate(null)
  }

  const formatTotalHours = (hours: number, minutes: number) => {
    const total = hours + minutes / 60
    return total.toFixed(1)
  }

  // Helper function to convert 12-hour to 24-hour format (same as backend)
  const convertTo24Hour = (hour: number, amPm: 'AM' | 'PM'): number => {
    if (hour === 12 && amPm === 'AM') return 0
    if (hour === 12 && amPm === 'PM') return 12
    if (amPm === 'PM') return hour + 12
    return hour
  }

  // Calculate weekly analytics
  const calculateWeeklyStats = () => {
    if (!workHourEntries) {
      return {
        totalHours: 0,
        totalMinutes: 0,
        homeHours: 0,
        homeMinutes: 0,
        officeHours: 0,
        officeMinutes: 0,
        breakHours: 0,
        breakMinutes: 0,
      }
    }

    let totalWorkMinutes = 0
    let homeWorkMinutes = 0
    let officeWorkMinutes = 0
    let totalBreakMinutes = 0

    workHourEntries.forEach(entry => {
      // Add total work time
      totalWorkMinutes += entry.work_hours * 60 + entry.work_minutes

      // Add break time
      if (
        entry.break_hours !== undefined &&
        entry.break_minutes !== undefined
      ) {
        totalBreakMinutes += entry.break_hours * 60 + entry.break_minutes
      }

      // Calculate home vs office time based on work_location
      if (entry.work_location === 'hybrid') {
        // For hybrid work, calculate home and office times separately
        if (
          entry.work_home_start_hour !== undefined &&
          entry.work_home_start_minute !== undefined &&
          entry.work_home_start_am_pm &&
          entry.work_home_end_hour !== undefined &&
          entry.work_home_end_minute !== undefined &&
          entry.work_home_end_am_pm
        ) {
          const homeStart =
            convertTo24Hour(
              entry.work_home_start_hour,
              entry.work_home_start_am_pm
            ) *
              60 +
            entry.work_home_start_minute
          const homeEnd =
            convertTo24Hour(
              entry.work_home_end_hour,
              entry.work_home_end_am_pm
            ) *
              60 +
            entry.work_home_end_minute
          let homeTime = homeEnd - homeStart
          if (homeTime < 0) homeTime += 24 * 60 // Handle next day
          homeWorkMinutes += Math.max(0, homeTime)
        }

        if (
          entry.work_office_start_hour !== undefined &&
          entry.work_office_start_minute !== undefined &&
          entry.work_office_start_am_pm &&
          entry.work_office_end_hour !== undefined &&
          entry.work_office_end_minute !== undefined &&
          entry.work_office_end_am_pm
        ) {
          const officeStart =
            convertTo24Hour(
              entry.work_office_start_hour,
              entry.work_office_start_am_pm
            ) *
              60 +
            entry.work_office_start_minute
          const officeEnd =
            convertTo24Hour(
              entry.work_office_end_hour,
              entry.work_office_end_am_pm
            ) *
              60 +
            entry.work_office_end_minute
          let officeTime = officeEnd - officeStart
          if (officeTime < 0) officeTime += 24 * 60 // Handle next day
          officeWorkMinutes += Math.max(0, officeTime)
        }
      } else {
        // For single location work, add to appropriate category
        const workMinutes = entry.work_hours * 60 + entry.work_minutes
        if (entry.work_location === 'home' || entry.work_from_home) {
          homeWorkMinutes += workMinutes
        } else {
          officeWorkMinutes += workMinutes
        }
      }
    })

    return {
      totalHours: Math.floor(totalWorkMinutes / 60),
      totalMinutes: totalWorkMinutes % 60,
      homeHours: Math.floor(homeWorkMinutes / 60),
      homeMinutes: homeWorkMinutes % 60,
      officeHours: Math.floor(officeWorkMinutes / 60),
      officeMinutes: officeWorkMinutes % 60,
      breakHours: Math.floor(totalBreakMinutes / 60),
      breakMinutes: totalBreakMinutes % 60,
    }
  }

  const weeklyStats = calculateWeeklyStats()

  // Calculate contracted vs actual hours
  const contractedWeeklyHours = accountSettings?.work_hours || 0
  const contractedWeeklyMinutes = accountSettings?.work_minutes || 0
  const totalContractedMinutes =
    contractedWeeklyHours * 60 + contractedWeeklyMinutes
  const totalActualMinutes =
    weeklyStats.totalHours * 60 + weeklyStats.totalMinutes
  const differenceMinutes = totalActualMinutes - totalContractedMinutes
  const differenceHours = Math.floor(Math.abs(differenceMinutes) / 60)
  const remainingMinutes = Math.abs(differenceMinutes) % 60
  const isOvertime = differenceMinutes > 0

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-6'>
      {/* Header */}
      <PageHeader
        title='Work Hours'
        description={`Track your daily work hours for ${formatWeekRange(currentWeek.startDate, currentWeek.endDate)}`}
      />

      {/* Weekly Dashboard */}
      <div className='bg-muted/30 rounded-lg p-6'>
        <div className='mb-4'>
          <h2 className='text-lg font-semibold'>Week Summary</h2>
          <p className='text-muted-foreground text-sm'>
            Your work analytics for this week
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
          {/* Total Hours */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
              <span className='text-sm font-medium'>Total Hours</span>
            </div>
            <div className='text-2xl font-bold'>
              {formatTotalHours(
                weeklyStats.totalHours,
                weeklyStats.totalMinutes
              )}
              h
            </div>
          </div>

          {/* Home Hours */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-green-500'></div>
              <span className='text-sm font-medium'>🏠 Home</span>
            </div>
            <div className='text-2xl font-bold'>
              {formatTotalHours(weeklyStats.homeHours, weeklyStats.homeMinutes)}
              h
            </div>
          </div>

          {/* Office Hours */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-purple-500'></div>
              <span className='text-sm font-medium'>🏢 Office</span>
            </div>
            <div className='text-2xl font-bold'>
              {formatTotalHours(
                weeklyStats.officeHours,
                weeklyStats.officeMinutes
              )}
              h
            </div>
          </div>

          {/* Break Time */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-orange-500'></div>
              <span className='text-sm font-medium'>☕ Breaks</span>
            </div>
            <div className='text-2xl font-bold'>
              {formatTotalHours(
                weeklyStats.breakHours,
                weeklyStats.breakMinutes
              )}
              h
            </div>
          </div>

          {/* Contract Status */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div
                className={`h-2 w-2 rounded-full ${isOvertime ? 'bg-red-500' : differenceMinutes === 0 ? 'bg-green-500' : 'bg-yellow-500'}`}
              ></div>
              <span className='text-sm font-medium'>vs Contract</span>
            </div>
            <div className='text-2xl font-bold'>
              {differenceMinutes === 0
                ? 'On Track'
                : `${isOvertime ? '+' : '-'}${differenceHours}:${remainingMinutes.toString().padStart(2, '0')}`}
            </div>
            <div className='text-muted-foreground mt-1 text-xs'>
              {isOvertime
                ? 'Overtime'
                : differenceMinutes === 0
                  ? 'Perfect!'
                  : 'Under'}
            </div>
          </div>
        </div>

        {/* Contract Details */}
        {accountSettings && (
          <div className='border-border mt-4 border-t pt-4'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                Contracted:{' '}
                {formatTotalHours(
                  contractedWeeklyHours,
                  contractedWeeklyMinutes
                )}
                h/week
              </span>
              <span className='text-muted-foreground'>
                Actual:{' '}
                {formatTotalHours(
                  weeklyStats.totalHours,
                  weeklyStats.totalMinutes
                )}
                h
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Week Days - Single Column */}
      <div className='space-y-4'>
        {weekDays.map(day => {
          const workEntry = workHourMap.get(day.dateString)
          const canEdit = isDateEditable(day.date)
          const isEditing = editingDate === day.dateString

          return (
            <div
              key={day.dateString}
              className={`rounded-lg border p-4 transition-colors ${day.isToday ? 'border-primary bg-primary/5' : 'border-border'} ${workEntry ? 'bg-green-50 dark:bg-green-950/20' : ''} `}
            >
              {/* Day Header */}
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`text-lg font-semibold ${day.isToday ? 'text-primary' : ''}`}
                  >
                    {day.dayName}
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {formatDateForDisplay(day.date)}
                  </div>
                  {day.isToday && (
                    <div className='bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs'>
                      Today
                    </div>
                  )}
                </div>

                {/* Edit/Add Button */}
                {canEdit && !isEditing && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleEditDay(day.dateString)}
                    className='flex items-center space-x-2'
                  >
                    {workEntry ? (
                      <>
                        <Edit3 className='h-4 w-4' />
                        <span>Edit</span>
                      </>
                    ) : (
                      <>
                        <Plus className='h-4 w-4' />
                        <span>Add Hours</span>
                      </>
                    )}
                  </Button>
                )}

                {!canEdit && (
                  <div className='text-muted-foreground rounded border px-3 py-1 text-xs'>
                    Future Date
                  </div>
                )}
              </div>

              {/* Content Area */}
              {isEditing ? (
                <WorkHourInlineForm
                  date={day.dateString}
                  existingEntry={workEntry}
                  defaultSettings={accountSettings || undefined}
                  onCancel={handleCancelEdit}
                  onSuccess={handleSaveSuccess}
                />
              ) : (
                <div className='space-y-2'>
                  {workEntry ? (
                    <div className='space-y-3'>
                      {/* Work Hours Summary */}
                      <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-3'>
                        <div>
                          <div className='text-muted-foreground'>
                            Work Hours
                          </div>
                          <div className='font-medium text-green-600 dark:text-green-400'>
                            {formatTotalHours(
                              workEntry.work_hours,
                              workEntry.work_minutes
                            )}
                            h
                          </div>
                        </div>

                        <div>
                          <div className='text-muted-foreground'>Location</div>
                          <div className='font-medium'>
                            {workEntry.work_location === 'hybrid'
                              ? '🔄 Hybrid'
                              : workEntry.work_location === 'home'
                                ? '🏠 Home'
                                : workEntry.work_location === 'office'
                                  ? '🏢 Office'
                                  : workEntry.work_from_home
                                    ? '🏠 Home'
                                    : '🏢 Office'}
                          </div>
                        </div>

                        {workEntry.break_hours !== undefined &&
                          workEntry.break_minutes !== undefined && (
                            <div>
                              <div className='text-muted-foreground'>
                                Break Time
                              </div>
                              <div className='font-medium'>
                                {formatTotalHours(
                                  workEntry.break_hours,
                                  workEntry.break_minutes
                                )}
                                h
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Schedule Details */}
                      {workEntry.work_location === 'hybrid' ? (
                        /* Hybrid Work Schedule */
                        <div className='space-y-2'>
                          {workEntry.work_home_start_hour !== undefined &&
                            workEntry.work_home_start_minute !== undefined &&
                            workEntry.work_home_start_am_pm &&
                            workEntry.work_home_end_hour !== undefined &&
                            workEntry.work_home_end_minute !== undefined &&
                            workEntry.work_home_end_am_pm && (
                              <div className='flex items-center gap-2 text-sm'>
                                <span className='text-muted-foreground font-medium'>
                                  🏠 Home:
                                </span>
                                <span className='font-medium'>
                                  {workEntry.work_home_start_hour}:
                                  {workEntry.work_home_start_minute
                                    .toString()
                                    .padStart(2, '0')}{' '}
                                  {workEntry.work_home_start_am_pm} -{' '}
                                  {workEntry.work_home_end_hour}:
                                  {workEntry.work_home_end_minute
                                    .toString()
                                    .padStart(2, '0')}{' '}
                                  {workEntry.work_home_end_am_pm}
                                </span>
                              </div>
                            )}

                          {workEntry.work_office_start_hour !== undefined &&
                            workEntry.work_office_start_minute !== undefined &&
                            workEntry.work_office_start_am_pm &&
                            workEntry.work_office_end_hour !== undefined &&
                            workEntry.work_office_end_minute !== undefined &&
                            workEntry.work_office_end_am_pm && (
                              <div className='flex items-center gap-2 text-sm'>
                                <span className='text-muted-foreground font-medium'>
                                  🏢 Office:
                                </span>
                                <span className='font-medium'>
                                  {workEntry.work_office_start_hour}:
                                  {workEntry.work_office_start_minute
                                    .toString()
                                    .padStart(2, '0')}{' '}
                                  {workEntry.work_office_start_am_pm} -{' '}
                                  {workEntry.work_office_end_hour}:
                                  {workEntry.work_office_end_minute
                                    .toString()
                                    .padStart(2, '0')}{' '}
                                  {workEntry.work_office_end_am_pm}
                                </span>
                              </div>
                            )}
                        </div>
                      ) : (
                        /* Single Location Schedule */
                        workEntry.work_start_hour !== undefined &&
                        workEntry.work_start_minute !== undefined &&
                        workEntry.work_start_am_pm &&
                        workEntry.work_end_hour !== undefined &&
                        workEntry.work_end_minute !== undefined &&
                        workEntry.work_end_am_pm && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground font-medium'>
                              Schedule:{' '}
                            </span>
                            <span className='font-medium'>
                              {workEntry.work_start_hour}:
                              {workEntry.work_start_minute
                                .toString()
                                .padStart(2, '0')}{' '}
                              {workEntry.work_start_am_pm} -{' '}
                              {workEntry.work_end_hour}:
                              {workEntry.work_end_minute
                                .toString()
                                .padStart(2, '0')}{' '}
                              {workEntry.work_end_am_pm}
                            </span>
                          </div>
                        )
                      )}

                      {workEntry.notes && (
                        <div className='text-sm'>
                          <span className='text-muted-foreground font-medium'>
                            Notes:{' '}
                          </span>
                          <span className='font-medium'>{workEntry.notes}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='text-muted-foreground py-8 text-center'>
                      {canEdit ? (
                        <div className='space-y-2'>
                          <div className='text-4xl'>⏰</div>
                          <div>No work hours recorded for this day</div>
                          <div className='text-sm'>
                            Click &ldquo;Add Hours&rdquo; to get started
                          </div>
                        </div>
                      ) : (
                        <div className='space-y-2'>
                          <div className='text-4xl'>📅</div>
                          <div>Future date - cannot add hours yet</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
