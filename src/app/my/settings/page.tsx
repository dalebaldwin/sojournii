'use client'

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
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const accountSettings = useAccountSettings()
  const updateAccountSettings = useUpdateAccountSettings()
  const [editingNotification, setEditingNotification] = useState(false)
  const [editingPerfQuestions, setEditingPerfQuestions] = useState(false)

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
    setPerfQuestions(accountSettings.perf_questions || [])
  }, [accountSettings])

  // Email validation
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

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
  // TODO: Backend must support these fields for this to work
  const handleSavePerfQuestions = () => {
    if (!accountSettings?._id) return
    updateAccountSettings({
      id: accountSettings._id,
      // perf_questions: perfQuestions,
      // perf_questions_set: true,
    })
    setEditingPerfQuestions(false)
  }

  // Find selected timezone object
  const selectedTimezone = timezones.find(tz => tz.value === notifTimezone)

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Heading level='h1' weight='bold' className='mb-2'>
          Settings
        </Heading>
        <p className='text-muted-foreground'>
          Customize your notification preferences and other settings.
        </p>
      </div>

      <div className='max-w-2xl space-y-6'>
        {/* Notification Settings Section */}
        <div className='bg-muted rounded-lg p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <Heading level='h2' weight='bold'>
              Notification Settings
            </Heading>
            <Button size='sm' onClick={() => setEditingNotification(e => !e)}>
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
                    <div className='bg-background z-50 mt-2 rounded-lg border p-2 shadow-lg'>
                      <Command className='rounded-lg border shadow-md'>
                        <CommandInput placeholder='Search for your timezone...' />
                        <CommandList className='max-h-64'>
                          <CommandEmpty>No timezone found.</CommandEmpty>
                          <CommandGroup>
                            {timezones.map(tz => (
                              <CommandItem
                                key={tz.value}
                                value={`${tz.city} ${tz.country} ${tz.label}`}
                                onSelect={() => {
                                  setNotifTimezone(tz.value)
                                  setShowTimezoneSelector(false)
                                }}
                                className='cursor-pointer'
                              >
                                <div className='flex w-full flex-col'>
                                  <div className='font-medium'>
                                    {tz.city}, {tz.country}
                                  </div>
                                  <div className='text-muted-foreground text-sm'>
                                    {tz.label}
                                  </div>
                                </div>
                                {notifTimezone === tz.value && (
                                  <div className='text-primary ml-auto'>✓</div>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                  )}
                </div>
              </div>
              {/* Inline day/hour/minute/am-pm selects */}
              <div className='flex items-end gap-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium'>Day</label>
                  <select
                    className='rounded border px-3 py-2'
                    value={notifDay}
                    onChange={e =>
                      setNotifDay(e.target.value as typeof notifDay)
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
                  <label className='mb-1 block text-sm font-medium'>Hour</label>
                  <select
                    className='rounded border px-3 py-2'
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
                    className='rounded border px-3 py-2'
                    value={notifMinute}
                    onChange={e => setNotifMinute(Number(e.target.value))}
                  >
                    {minutes.map(min => (
                      <option key={min.value} value={min.value}>
                        {min.label}
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
                    onChange={e => setNotifAmPm(e.target.value as 'AM' | 'PM')}
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
                  <div className='mt-1 text-xs text-red-500'>{emailError}</div>
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
            <Button size='sm' onClick={() => setEditingPerfQuestions(e => !e)}>
              {editingPerfQuestions ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          {!editingPerfQuestions ? (
            <div className='space-y-2'>
              {accountSettings?.perf_questions?.length ? (
                accountSettings.perf_questions.map((q, i) => (
                  <div key={i} className='mb-2'>
                    <div className='font-medium'>{q.title}</div>
                    <div className='text-muted-foreground text-sm whitespace-pre-line'>
                      {q.description}
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-muted-foreground text-sm'>
                  No performance questions set.
                </div>
              )}
            </div>
          ) : (
            <form
              className='space-y-3'
              onSubmit={e => {
                e.preventDefault()
                handleSavePerfQuestions()
              }}
            >
              {perfQuestions.map((q, i) => (
                <div key={i} className='mb-2'>
                  <input
                    className='mb-1 w-full rounded border px-3 py-2 font-medium'
                    value={q.title}
                    onChange={e => {
                      const arr = [...perfQuestions]
                      arr[i].title = e.target.value
                      setPerfQuestions(arr)
                    }}
                    placeholder='Question Title'
                  />
                  <textarea
                    className='w-full rounded border px-3 py-2'
                    value={q.description}
                    onChange={e => {
                      const arr = [...perfQuestions]
                      arr[i].description = e.target.value
                      setPerfQuestions(arr)
                    }}
                    placeholder='Question Text'
                  />
                </div>
              ))}
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() =>
                  setPerfQuestions([
                    ...perfQuestions,
                    { title: '', description: '' },
                  ])
                }
              >
                Add Question
              </Button>
              <Button type='submit' size='sm'>
                Save
              </Button>
            </form>
          )}
          <p className='text-muted-foreground mt-2 text-xs'>
            These questions will be available for you to use when creating new
            performance entries. You can edit or add to them at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
