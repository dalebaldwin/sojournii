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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateAccountSettings } from '@/hooks/useAccountSettings'
import { convertTo24Hour } from '@/lib/time-functions'
import { timezones } from '@/lib/timezones'
import { amPmOptions, daysOfWeek, hours12 } from '@/lib/welcome-data'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Doc } from '../../../../../convex/_generated/dataModel'

interface NotificationSettingsSectionProps {
  accountSettings: Doc<'account_settings'> | null | undefined
}

export function NotificationSettingsSection({
  accountSettings,
}: NotificationSettingsSectionProps) {
  const updateAccountSettings = useUpdateAccountSettings()
  const [editing, setEditing] = useState(false)

  // Form state
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

  // Sync form state with account settings - only when needed
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
  }, [accountSettings])

  const validateEmail = useCallback(
    (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    []
  )

  const handleSave = useCallback(() => {
    if (!validateEmail(notifEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }
    setEmailError('')
    if (!accountSettings?._id) return

    updateAccountSettings({
      id: accountSettings._id,
      notifications_email: notifEmail,
      weekly_reminder_time_zone: notifTimezone,
      weekly_reminder_day: notifDay,
      weekly_reminder_hour: convertTo24Hour(Number(notifHour), notifAmPm),
      weekly_reminder_minute: notifMinute,
    })
    setEditing(false)
  }, [
    notifEmail,
    notifTimezone,
    notifDay,
    notifHour,
    notifAmPm,
    notifMinute,
    accountSettings?._id,
    updateAccountSettings,
    validateEmail,
  ])

  const selectedTimezone = useMemo(
    () => timezones.find(tz => tz.value === notifTimezone),
    [notifTimezone]
  )

  return (
    <div className='bg-muted rounded-lg p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <Heading level='h2' weight='bold'>
          Notification Settings
        </Heading>
        <Button size='sm' onClick={() => setEditing(e => !e)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {!editing ? (
        <div className='space-y-2'>
          <div>
            <span className='font-medium'>Timezone:</span>{' '}
            {accountSettings?.weekly_reminder_time_zone}
          </div>
          <div>
            <span className='font-medium'>Reminder Time:</span>{' '}
            {accountSettings?.weekly_reminder_day},{' '}
            {accountSettings?.weekly_reminder_hour?.toString().padStart(2, '0')}
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
            This only impacts notifications for the weekly reminder. All other
            communications will be sent to your account email.
          </p>
        </div>
      ) : (
        <form
          className='space-y-3'
          onSubmit={e => {
            e.preventDefault()
            handleSave()
          }}
        >
          {/* Timezone select with Command menu */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Timezone</label>
            <div className='relative'>
              <Button
                type='button'
                variant='outline'
                className='w-full justify-between text-left'
                onClick={() => setShowTimezoneSelector(!showTimezoneSelector)}
              >
                {selectedTimezone
                  ? `${selectedTimezone.city}, ${selectedTimezone.country} (${selectedTimezone.label})`
                  : 'Select timezone'}
                <svg
                  className={`h-4 w-4 transition-transform ${showTimezoneSelector ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </Button>
              {showTimezoneSelector && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className='fixed inset-0 z-40'
                    onClick={() => setShowTimezoneSelector(false)}
                  />
                  <div className='absolute z-50 mt-1 w-full max-w-md'>
                    <Command className='border-border bg-background rounded-lg border shadow-lg'>
                      <CommandInput placeholder='Search timezones...' />
                      <CommandList className='max-h-[200px] overflow-y-auto'>
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
                                <span className='text-muted-foreground text-xs'>
                                  {tz.label}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Day, Hour, Minute, AM/PM */}
          <div className='grid grid-cols-4 gap-2'>
            <div>
              <label className='mb-1 block text-sm font-medium'>Day</label>
              <Select
                value={notifDay}
                onValueChange={value =>
                  setNotifDay(
                    value as
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
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium'>Hour</label>
              <Select
                value={notifHour.toString()}
                onValueChange={value => setNotifHour(Number(value))}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours12.map(hour => (
                    <SelectItem key={hour.value} value={hour.value.toString()}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium'>Minute</label>
              <Select
                value={notifMinute.toString()}
                onValueChange={value => setNotifMinute(Number(value))}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>00</SelectItem>
                  <SelectItem value='15'>15</SelectItem>
                  <SelectItem value='30'>30</SelectItem>
                  <SelectItem value='45'>45</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium'>AM/PM</label>
              <Select
                value={notifAmPm}
                onValueChange={value => setNotifAmPm(value as 'AM' | 'PM')}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {amPmOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email field with validation */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Notification Email
            </label>
            <Input
              type='email'
              value={notifEmail}
              onChange={e => setNotifEmail(e.target.value)}
              className={
                emailError ? 'border-red-500 focus-visible:ring-red-500' : ''
              }
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
  )
}
