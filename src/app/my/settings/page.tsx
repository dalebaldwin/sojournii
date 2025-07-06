'use client'

import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { PerformanceQuestionEditor } from '@/components/PerformanceQuestionEditor'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Heading } from '@/components/ui/heading'
import {
  useAccountSettings,
  useUpdateAccountSettings,
} from '@/hooks/useAccountSettings'
import { convertTo24Hour } from '@/lib/time-functions'
import { timezones } from '@/lib/timezones'
import {
  amPmOptions,
  daysOfWeek,
  hours12,
  minutes,
  PerformanceQuestion,
} from '@/lib/welcome-data'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export default function SettingsPage() {
  const accountSettings = useAccountSettings()
  const updateAccountSettings = useUpdateAccountSettings()
  const [editingNotification, setEditingNotification] = useState(false)

  // Notification form state
  const [notifEmail, setNotifEmail] = useState('')
  const [notifTimezone, setNotifTimezone] = useState('')
  const [notifDay, setNotifDay] = useState<
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  >('friday')
  const [notifHour, setNotifHour] = useState<number>(4)
  const [notifMinute, setNotifMinute] = useState<number>(30)
  const [notifAmPm, setNotifAmPm] = useState<'AM' | 'PM'>('PM')
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Perf questions form state
  const [perfQuestions, setPerfQuestions] = useState<PerformanceQuestion[]>([])
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null)
  const [savingQuestions, setSavingQuestions] = useState(false)

  // Work hours form state
  const [workHours, setWorkHours] = useState<number>(38)
  const [workMinutes, setWorkMinutes] = useState<number>(0)
  const [defaultWorkFromHome, setDefaultWorkFromHome] = useState<boolean>(false)
  const [breakHours, setBreakHours] = useState<number>(0)
  const [breakMinutes, setBreakMinutes] = useState<number>(30)
  const [editingWorkHours, setEditingWorkHours] = useState(false)
  const [savingWorkHours, setSavingWorkHours] = useState(false)

  // Sync form state with accountSettings when it loads
  useEffect(() => {
    if (!accountSettings) return
    setNotifEmail(accountSettings.notifications_email || '')
    setNotifTimezone(accountSettings.weekly_reminder_time_zone || '')
    setNotifDay(accountSettings.weekly_reminder_day || 'friday')
    setNotifMinute(accountSettings.weekly_reminder_minute || 30)
    // Convert 24-hour to 12-hour and AM/PM
    const hour24 = accountSettings.weekly_reminder_hour
    if (hour24 === 0) {
      setNotifHour(12)
      setNotifAmPm('AM')
    } else if (hour24 === 12) {
      setNotifHour(12)
      setNotifAmPm('PM')
    } else if (hour24 > 12) {
      setNotifHour(hour24 - 12)
      setNotifAmPm('PM')
    } else {
      setNotifHour(hour24)
      setNotifAmPm('AM')
    }
    // Filter out any blank questions when loading
    const validQuestions = (accountSettings.perf_questions || []).filter(
      q => q.title.trim() && q.description.trim()
    )
    setPerfQuestions(validQuestions)

    // Clean up any blank questions in the database
    if (
      accountSettings.perf_questions &&
      accountSettings.perf_questions.length !== validQuestions.length
    ) {
      cleanupBlankQuestions(validQuestions)
    }

    // Load work hours data
    setWorkHours(accountSettings.work_hours || 38)
    setWorkMinutes(accountSettings.work_minutes || 0)
    setDefaultWorkFromHome(accountSettings.default_work_from_home || false)
    setBreakHours(accountSettings.break_hours || 0)
    setBreakMinutes(accountSettings.break_minutes || 30)
  }, [accountSettings])

  // Clean up blank questions from database
  const cleanupBlankQuestions = useCallback(
    async (validQuestions: PerformanceQuestion[]) => {
      if (!accountSettings?._id) return

      try {
        await updateAccountSettings({
          id: accountSettings._id,
          perf_questions: validQuestions,
        })
      } catch (error) {
        console.error('Error cleaning up blank questions:', error)
      }
    },
    [accountSettings?._id, updateAccountSettings]
  )

  // Email validation
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Question validation
  const validateQuestion = (question: PerformanceQuestion): boolean => {
    return (
      question.title.trim().length > 0 && question.description.trim().length > 0
    )
  }

  // Save handlers
  const handleSaveNotification = () => {
    if (!validateEmail(notifEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }
    setEmailError('')
    if (!accountSettings?._id) return // Defensive: must have _id
    updateAccountSettings({
      id: accountSettings._id,
      notifications_email: notifEmail,
      weekly_reminder_time_zone: notifTimezone,
      weekly_reminder_day: notifDay,
      weekly_reminder_hour: convertTo24Hour(Number(notifHour), notifAmPm),
      weekly_reminder_minute: notifMinute,
    })
    setEditingNotification(false)
  }

  // Individual question handlers
  const handleUpdateQuestion = async (
    index: number,
    updatedQuestion: PerformanceQuestion
  ) => {
    // Don't save if the question is empty
    if (!validateQuestion(updatedQuestion)) {
      console.warn('Attempted to save empty question, skipping')
      return
    }

    const newQuestions = [...perfQuestions]
    newQuestions[index] = updatedQuestion
    setPerfQuestions(newQuestions)

    // Save immediately after updating
    if (accountSettings?._id) {
      setSavingQuestions(true)
      try {
        await updateAccountSettings({
          id: accountSettings._id,
          perf_questions: newQuestions,
        })
      } finally {
        setSavingQuestions(false)
      }
    }
  }

  const handleDeleteQuestion = async (index: number) => {
    const newQuestions = perfQuestions.filter((_, i) => i !== index)
    setPerfQuestions(newQuestions)
    // Save immediately after deletion
    if (accountSettings?._id) {
      setSavingQuestions(true)
      try {
        await updateAccountSettings({
          id: accountSettings._id,
          perf_questions: newQuestions,
        })
      } finally {
        setSavingQuestions(false)
      }
    }
  }

  const handleAddQuestion = () => {
    const newQuestions = [...perfQuestions, { title: '', description: '' }]
    setPerfQuestions(newQuestions)
    setEditingQuestionIndex(perfQuestions.length)
  }

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index)
  }

  const handleCancelEdit = () => {
    setEditingQuestionIndex(null)
  }

  const handleSaveQuestion = async () => {
    setEditingQuestionIndex(null)
    // The save is now handled in handleUpdateQuestion
  }

  // Work hours save handler
  const handleSaveWorkHours = async () => {
    if (!accountSettings?._id) return

    setSavingWorkHours(true)
    try {
      await updateAccountSettings({
        id: accountSettings._id,
        work_hours: workHours,
        work_minutes: workMinutes,
        default_work_from_home: defaultWorkFromHome,
        break_hours: breakHours,
        break_minutes: breakMinutes,
      })
      setEditingWorkHours(false)
    } catch (error) {
      console.error('Error saving work hours:', error)
    } finally {
      setSavingWorkHours(false)
    }
  }

  // Find selected timezone object
  const selectedTimezone = timezones.find(tz => tz.value === notifTimezone)

  return (
    <OnboardingGuard>
      <div className='flex min-h-screen items-center justify-center p-6'>
        <div className='w-full max-w-2xl'>
          <div className='mb-6 text-center'>
            <Heading level='h1' weight='bold' className='mb-2'>
              Settings
            </Heading>
            <p className='text-muted-foreground'>
              Customize your notification preferences and other settings.
            </p>
          </div>

          <div className='space-y-6'>
            {/* Notification Settings Section */}
            <div className='bg-muted rounded-lg p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <Heading level='h2' weight='bold'>
                  Notification Settings
                </Heading>
                <Button
                  size='sm'
                  onClick={() => setEditingNotification(e => !e)}
                >
                  {editingNotification ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              {!editingNotification ? (
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Timezone:</span>{' '}
                    {accountSettings?.weekly_reminder_time_zone}
                  </div>
                  <div>
                    <span className='font-medium'>Reminder Time:</span>{' '}
                    {accountSettings?.weekly_reminder_day},{' '}
                    {accountSettings?.weekly_reminder_hour
                      ?.toString()
                      .padStart(2, '0')}
                    :
                    {accountSettings?.weekly_reminder_minute
                      ?.toString()
                      .padStart(2, '0')}
                  </div>
                  <div>
                    <span className='font-medium'>Notification Email:</span>{' '}
                    {accountSettings?.notifications_email}
                    <span className='ml-2 text-xs'>
                      (
                      <Link href='/my/accounts' className='underline'>
                        Change account email
                      </Link>
                      )
                    </span>
                  </div>
                  <p className='text-muted-foreground mt-2 text-xs'>
                    This only impacts notifications for the weekly reminder. All
                    other communications will be sent to your account email.
                  </p>
                </div>
              ) : (
                <form
                  className='space-y-3'
                  onSubmit={e => {
                    e.preventDefault()
                    handleSaveNotification()
                  }}
                >
                  {/* Timezone select with Command menu */}
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Timezone
                    </label>
                    <div>
                      <Button
                        type='button'
                        variant='outline'
                        className='w-full text-left'
                        onClick={() => setShowTimezoneSelector(true)}
                      >
                        {selectedTimezone
                          ? `${selectedTimezone.city}, ${selectedTimezone.country} (${selectedTimezone.label})`
                          : 'Select timezone'}
                      </Button>
                      {showTimezoneSelector && (
                        <div className='absolute z-50 mt-1 w-full'>
                          <Command className='border-border bg-background rounded-lg border shadow-lg'>
                            <CommandInput placeholder='Search timezones...' />
                            <CommandList>
                              <CommandEmpty>No timezone found.</CommandEmpty>
                              <CommandGroup>
                                {timezones.map(tz => (
                                  <CommandItem
                                    key={tz.value}
                                    onSelect={() => {
                                      setNotifTimezone(tz.value)
                                      setShowTimezoneSelector(false)
                                    }}
                                  >
                                    <div className='flex w-full items-center justify-between'>
                                      <span>
                                        {tz.city}, {tz.country}
                                      </span>
                                      <span className='text-muted-foreground'>
                                        {tz.label}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day, Hour, Minute, AM/PM */}
                  <div className='grid grid-cols-4 gap-2'>
                    <div>
                      <label className='mb-1 block text-sm font-medium'>
                        Day
                      </label>
                      <select
                        className='w-full rounded border px-3 py-2'
                        value={notifDay}
                        onChange={e =>
                          setNotifDay(
                            e.target.value as
                              | 'monday'
                              | 'tuesday'
                              | 'wednesday'
                              | 'thursday'
                              | 'friday'
                              | 'saturday'
                              | 'sunday'
                          )
                        }
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-medium'>
                        Hour
                      </label>
                      <select
                        className='w-full rounded border px-3 py-2'
                        value={notifHour}
                        onChange={e => setNotifHour(Number(e.target.value))}
                      >
                        {hours12.map(hour => (
                          <option key={hour.value} value={hour.value}>
                            {hour.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-medium'>
                        Minute
                      </label>
                      <select
                        className='w-full rounded border px-3 py-2'
                        value={notifMinute}
                        onChange={e => setNotifMinute(Number(e.target.value))}
                      >
                        {minutes.map(minute => (
                          <option key={minute.value} value={minute.value}>
                            {minute.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-medium'>
                        AM/PM
                      </label>
                      <select
                        className='rounded border px-3 py-2'
                        value={notifAmPm}
                        onChange={e =>
                          setNotifAmPm(e.target.value as 'AM' | 'PM')
                        }
                      >
                        {amPmOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Email field with validation */}
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Notification Email
                    </label>
                    <input
                      className={`w-full rounded border px-3 py-2 ${emailError ? 'border-red-500' : ''}`}
                      value={notifEmail}
                      onChange={e => setNotifEmail(e.target.value)}
                    />
                    {emailError && (
                      <div className='mt-1 text-xs text-red-500'>
                        {emailError}
                      </div>
                    )}
                  </div>
                  <Button type='submit' size='sm'>
                    Save
                  </Button>
                </form>
              )}
            </div>

            {/* Performance Questions Section */}
            <div className='bg-muted rounded-lg p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <Heading level='h2' weight='bold'>
                  Performance Questions
                </Heading>
                <Button size='sm' onClick={handleAddQuestion}>
                  Add Question
                </Button>
              </div>

              <div className='space-y-4'>
                {perfQuestions.length > 0 ? (
                  perfQuestions.map((question, index) => (
                    <PerformanceQuestionEditor
                      key={index}
                      question={question}
                      index={index}
                      onUpdate={handleUpdateQuestion}
                      onDelete={handleDeleteQuestion}
                      isEditing={editingQuestionIndex === index}
                      onEdit={() => handleEditQuestion(index)}
                      onCancel={handleCancelEdit}
                      onSave={handleSaveQuestion}
                      isSaving={savingQuestions}
                    />
                  ))
                ) : (
                  <div className='text-muted-foreground text-sm'>
                    No performance questions set. Click &quot;Add Question&quot;
                    to get started.
                  </div>
                )}
              </div>

              <p className='text-muted-foreground mt-4 text-xs'>
                These questions will be available for you to use when creating
                new performance entries. You can edit or add to them at any
                time.
              </p>
            </div>

            {/* Work Hours Section */}
            <div className='bg-muted rounded-lg p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <Heading level='h2' weight='bold'>
                  Work Hours
                </Heading>
                <Button size='sm' onClick={() => setEditingWorkHours(e => !e)}>
                  {editingWorkHours ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {!editingWorkHours ? (
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Work Hours:</span> {workHours}
                    h {workMinutes}m
                  </div>
                  <div>
                    <span className='font-medium'>Default Work Location:</span>{' '}
                    {defaultWorkFromHome ? 'Work from Home' : 'Office'}
                  </div>
                  <div>
                    <span className='font-medium'>Daily Break Time:</span>{' '}
                    {breakHours}h {breakMinutes}m
                  </div>
                </div>
              ) : (
                <form
                  className='space-y-4'
                  onSubmit={e => {
                    e.preventDefault()
                    handleSaveWorkHours()
                  }}
                >
                  {/* Work Hours */}
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Work Hours
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        min='1'
                        max='168'
                        value={workHours}
                        onChange={e => setWorkHours(Number(e.target.value))}
                        className='w-24 rounded border px-3 py-2'
                      />
                      <span className='text-muted-foreground text-sm'>
                        hours
                      </span>
                    </div>
                  </div>

                  {/* Work Minutes */}
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Work Minutes
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        min='0'
                        max='59'
                        value={workMinutes}
                        onChange={e => setWorkMinutes(Number(e.target.value))}
                        className='w-24 rounded border px-3 py-2'
                      />
                      <span className='text-muted-foreground text-sm'>
                        minutes
                      </span>
                    </div>
                  </div>

                  {/* Default Work Location */}
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Default Work Location
                    </label>
                    <div className='flex items-center gap-3'>
                      <button
                        type='button'
                        onClick={() => setDefaultWorkFromHome(false)}
                        className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                          !defaultWorkFromHome
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        Office
                      </button>
                      <button
                        type='button'
                        onClick={() => setDefaultWorkFromHome(true)}
                        className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                          defaultWorkFromHome
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        Work from Home
                      </button>
                    </div>
                  </div>

                  {/* Break Time */}
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Daily Break Time
                    </label>
                    <div className='flex items-center gap-2'>
                      <select
                        value={breakHours}
                        onChange={e => setBreakHours(Number(e.target.value))}
                        className='rounded border px-3 py-2'
                      >
                        {Array.from(
                          {
                            length:
                              Math.floor((workHours * 60 + workMinutes) / 5) +
                              1,
                          },
                          (_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          )
                        )}
                      </select>
                      <span className='text-muted-foreground text-sm'>
                        hours
                      </span>
                      <select
                        value={breakMinutes}
                        onChange={e => setBreakMinutes(Number(e.target.value))}
                        className='rounded border px-3 py-2'
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className='text-muted-foreground text-sm'>
                        minutes
                      </span>
                    </div>
                  </div>

                  <Button type='submit' size='sm' disabled={savingWorkHours}>
                    {savingWorkHours ? 'Saving...' : 'Save Work Hours'}
                  </Button>
                </form>
              )}

              <p className='text-muted-foreground mt-4 text-xs'>
                These settings help track your work hours and maintain a healthy
                work-life balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  )
}
