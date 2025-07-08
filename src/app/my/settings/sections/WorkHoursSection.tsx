'use client'

import { Button } from '@/components/ui/button'
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
import { amPmOptions, hours12 } from '@/lib/welcome-data'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { Doc } from '../../../../../convex/_generated/dataModel'

interface WorkHoursSectionProps {
  accountSettings: Doc<'account_settings'> | null | undefined
}

function WorkHoursSectionComponent({ accountSettings }: WorkHoursSectionProps) {
  const updateAccountSettings = useUpdateAccountSettings()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state with immediate UI updates
  const [workHours, setWorkHours] = useState<number>(38)
  const [workMinutes, setWorkMinutes] = useState<number>(0)
  const [workStartHour, setWorkStartHour] = useState<number>(9)
  const [workStartMinute, setWorkStartMinute] = useState<number>(0)
  const [workStartAmPm, setWorkStartAmPm] = useState<'AM' | 'PM'>('AM')
  const [workEndHour, setWorkEndHour] = useState<number>(5)
  const [workEndMinute, setWorkEndMinute] = useState<number>(0)
  const [workEndAmPm, setWorkEndAmPm] = useState<'AM' | 'PM'>('PM')
  const [defaultWorkFromHome, setDefaultWorkFromHome] = useState<boolean>(false)
  const [breakHours, setBreakHours] = useState<number>(0)
  const [breakMinutes, setBreakMinutes] = useState<number>(30)

  // Display values for immediate feedback (no validation delays)
  const [workHoursDisplay, setWorkHoursDisplay] = useState<string>('38')
  const [workMinutesDisplay, setWorkMinutesDisplay] = useState<string>('0')
  const [startMinuteDisplay, setStartMinuteDisplay] = useState<string>('0')
  const [endMinuteDisplay, setEndMinuteDisplay] = useState<string>('0')

  // Refs for debouncing
  const workHoursTimeout = useRef<NodeJS.Timeout | null>(null)
  const workMinutesTimeout = useRef<NodeJS.Timeout | null>(null)
  const startMinuteTimeout = useRef<NodeJS.Timeout | null>(null)
  const endMinuteTimeout = useRef<NodeJS.Timeout | null>(null)

  // Static break options - calculated once and cached
  const breakHourOptions = useMemo(() => {
    // Max reasonable break hours (up to 8 hours)
    return Array.from({ length: 9 }, (_, i) => i)
  }, [])

  const breakMinuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i),
    []
  )

  // Only sync when accountSettings actually changes
  useEffect(() => {
    if (!accountSettings) return

    const hours = accountSettings.work_hours || 37
    const minutes = accountSettings.work_minutes || 30

    setWorkHours(hours)
    setWorkMinutes(minutes)
    setWorkHoursDisplay(hours.toString())
    setWorkMinutesDisplay(minutes.toString())

    setDefaultWorkFromHome(accountSettings.default_work_from_home || false)
    setBreakHours(accountSettings.break_hours || 0)
    setBreakMinutes(accountSettings.break_minutes || 30)

    // Load work start time
    const startHour = accountSettings.work_start_hour || 9
    if (startHour === 0) {
      setWorkStartHour(12)
      setWorkStartAmPm('AM')
    } else if (startHour === 12) {
      setWorkStartHour(12)
      setWorkStartAmPm('PM')
    } else if (startHour > 12) {
      setWorkStartHour(startHour - 12)
      setWorkStartAmPm('PM')
    } else {
      setWorkStartHour(startHour)
      setWorkStartAmPm('AM')
    }
    const startMinute = accountSettings.work_start_minute || 0
    setWorkStartMinute(startMinute)
    setStartMinuteDisplay(startMinute.toString())

    // Load work end time
    const endHour = accountSettings.work_end_hour || 17
    if (endHour === 0) {
      setWorkEndHour(12)
      setWorkEndAmPm('AM')
    } else if (endHour === 12) {
      setWorkEndHour(12)
      setWorkEndAmPm('PM')
    } else if (endHour > 12) {
      setWorkEndHour(endHour - 12)
      setWorkEndAmPm('PM')
    } else {
      setWorkEndHour(endHour)
      setWorkEndAmPm('AM')
    }
    const endMinute = accountSettings.work_end_minute || 0
    setWorkEndMinute(endMinute)
    setEndMinuteDisplay(endMinute.toString())
  }, [accountSettings])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (workHoursTimeout.current) clearTimeout(workHoursTimeout.current)
      if (workMinutesTimeout.current) clearTimeout(workMinutesTimeout.current)
      if (startMinuteTimeout.current) clearTimeout(startMinuteTimeout.current)
      if (endMinuteTimeout.current) clearTimeout(endMinuteTimeout.current)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!accountSettings?._id) return

    setSaving(true)
    try {
      await updateAccountSettings({
        id: accountSettings._id,
        work_hours: workHours,
        work_minutes: workMinutes,
        work_start_hour: convertTo24Hour(workStartHour, workStartAmPm),
        work_start_minute: workStartMinute,
        work_start_am_pm: workStartAmPm,
        work_end_hour: convertTo24Hour(workEndHour, workEndAmPm),
        work_end_minute: workEndMinute,
        work_end_am_pm: workEndAmPm,
        default_work_from_home: defaultWorkFromHome,
        break_hours: breakHours,
        break_minutes: breakMinutes,
      })
      setEditing(false)
    } catch (error) {
      console.error('Error saving work hours:', error)
    } finally {
      setSaving(false)
    }
  }, [
    accountSettings?._id,
    workHours,
    workMinutes,
    workStartHour,
    workStartMinute,
    workStartAmPm,
    workEndHour,
    workEndMinute,
    workEndAmPm,
    defaultWorkFromHome,
    breakHours,
    breakMinutes,
    updateAccountSettings,
  ])

  // Immediate UI updates with debounced validation
  const handleWorkHoursChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setWorkHoursDisplay(value) // Immediate visual feedback

      // Clear previous timeout
      if (workHoursTimeout.current) {
        clearTimeout(workHoursTimeout.current)
      }

      // Debounced validation and state update
      workHoursTimeout.current = setTimeout(() => {
        startTransition(() => {
          const numValue = parseInt(value)
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 168) {
            setWorkHours(numValue)
          } else {
            setWorkHoursDisplay(workHours.toString()) // Reset display to valid value
          }
        })
      }, 300)
    },
    [workHours]
  )

  const handleWorkMinutesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setWorkMinutesDisplay(value) // Immediate visual feedback

      if (workMinutesTimeout.current) {
        clearTimeout(workMinutesTimeout.current)
      }

      workMinutesTimeout.current = setTimeout(() => {
        startTransition(() => {
          const numValue = parseInt(value)
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 59) {
            setWorkMinutes(numValue)
          } else {
            setWorkMinutesDisplay(workMinutes.toString())
          }
        })
      }, 300)
    },
    [workMinutes]
  )

  const handleStartMinuteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setStartMinuteDisplay(value) // Immediate visual feedback

      if (startMinuteTimeout.current) {
        clearTimeout(startMinuteTimeout.current)
      }

      startMinuteTimeout.current = setTimeout(() => {
        startTransition(() => {
          const numValue = parseInt(value)
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 59) {
            setWorkStartMinute(numValue)
          } else {
            setStartMinuteDisplay(workStartMinute.toString())
          }
        })
      }, 300)
    },
    [workStartMinute]
  )

  const handleEndMinuteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setEndMinuteDisplay(value) // Immediate visual feedback

      if (endMinuteTimeout.current) {
        clearTimeout(endMinuteTimeout.current)
      }

      endMinuteTimeout.current = setTimeout(() => {
        startTransition(() => {
          const numValue = parseInt(value)
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 59) {
            setWorkEndMinute(numValue)
          } else {
            setEndMinuteDisplay(workEndMinute.toString())
          }
        })
      }, 300)
    },
    [workEndMinute]
  )

  // Instant state updates for selects (no debouncing needed)
  const handleWorkStartHourChange = useCallback((value: string) => {
    setWorkStartHour(parseInt(value))
  }, [])

  const handleWorkStartAmPmChange = useCallback((value: string) => {
    setWorkStartAmPm(value as 'AM' | 'PM')
  }, [])

  const handleWorkEndHourChange = useCallback((value: string) => {
    setWorkEndHour(parseInt(value))
  }, [])

  const handleWorkEndAmPmChange = useCallback((value: string) => {
    setWorkEndAmPm(value as 'AM' | 'PM')
  }, [])

  const handleBreakHoursChange = useCallback((value: string) => {
    setBreakHours(Number(value))
  }, [])

  const handleBreakMinutesChange = useCallback((value: string) => {
    setBreakMinutes(Number(value))
  }, [])

  const handleDefaultWorkFromHomeOffice = useCallback(() => {
    setDefaultWorkFromHome(false)
  }, [])

  const handleDefaultWorkFromHomeWFH = useCallback(() => {
    setDefaultWorkFromHome(true)
  }, [])

  return (
    <div className='bg-muted rounded-lg p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <Heading level='h2' weight='bold'>
          Work Hours
        </Heading>
        <Button size='sm' onClick={() => setEditing(e => !e)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {!editing ? (
        <div className='space-y-2'>
          <div>
            <span className='font-medium'>Work Hours:</span> {workHours}h{' '}
            {workMinutes}m
          </div>
          <div>
            <span className='font-medium'>Work Schedule:</span> {workStartHour}:
            {workStartMinute.toString().padStart(2, '0')} {workStartAmPm} -{' '}
            {workEndHour}:{workEndMinute.toString().padStart(2, '0')}{' '}
            {workEndAmPm}
          </div>
          <div>
            <span className='font-medium'>Default Work Location:</span>{' '}
            {defaultWorkFromHome ? 'Work from Home' : 'Office'}
          </div>
          <div>
            <span className='font-medium'>Daily Break Time:</span> {breakHours}h{' '}
            {breakMinutes}m
          </div>
        </div>
      ) : (
        <form
          className='space-y-4'
          onSubmit={e => {
            e.preventDefault()
            handleSave()
          }}
        >
          {/* Work Hours */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Work Hours Per Week
            </label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                min='1'
                max='168'
                value={workHoursDisplay}
                onChange={handleWorkHoursChange}
                className={`w-24 ${isPending ? 'opacity-70' : ''}`}
              />
              <span className='text-muted-foreground text-sm'>h</span>
              <Input
                type='number'
                min='0'
                max='59'
                value={workMinutesDisplay}
                onChange={handleWorkMinutesChange}
                className={`w-24 ${isPending ? 'opacity-70' : ''}`}
              />
              <span className='text-muted-foreground text-sm'>m</span>
            </div>
          </div>

          {/* Work Schedule */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Work Schedule
            </label>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Start Time */}
              <div>
                <label className='text-muted-foreground mb-1 block text-xs'>
                  Start Time
                </label>
                <div className='flex items-center gap-2'>
                  <Select
                    value={workStartHour.toString()}
                    onValueChange={handleWorkStartHourChange}
                  >
                    <SelectTrigger className='w-20'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours12.map(hour => (
                        <SelectItem
                          key={hour.value}
                          value={hour.value.toString()}
                        >
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className='text-muted-foreground text-sm'>h</span>
                  <Input
                    type='number'
                    min='0'
                    max='59'
                    value={startMinuteDisplay}
                    onChange={handleStartMinuteChange}
                    className={`w-20 ${isPending ? 'opacity-70' : ''}`}
                  />
                  <span className='text-muted-foreground text-sm'>m</span>
                  <Select
                    value={workStartAmPm}
                    onValueChange={handleWorkStartAmPmChange}
                  >
                    <SelectTrigger className='w-20'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {amPmOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className='text-muted-foreground mb-1 block text-xs'>
                  End Time
                </label>
                <div className='flex items-center gap-2'>
                  <Select
                    value={workEndHour.toString()}
                    onValueChange={handleWorkEndHourChange}
                  >
                    <SelectTrigger className='w-20'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours12.map(hour => (
                        <SelectItem
                          key={hour.value}
                          value={hour.value.toString()}
                        >
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className='text-muted-foreground text-sm'>h</span>
                  <Input
                    type='number'
                    min='0'
                    max='59'
                    value={endMinuteDisplay}
                    onChange={handleEndMinuteChange}
                    className={`w-20 ${isPending ? 'opacity-70' : ''}`}
                  />
                  <span className='text-muted-foreground text-sm'>m</span>
                  <Select
                    value={workEndAmPm}
                    onValueChange={handleWorkEndAmPmChange}
                  >
                    <SelectTrigger className='w-20'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {amPmOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                onClick={handleDefaultWorkFromHomeOffice}
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
                onClick={handleDefaultWorkFromHomeWFH}
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
              <Select
                value={breakHours.toString()}
                onValueChange={handleBreakHoursChange}
              >
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breakHourOptions.map(i => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className='text-muted-foreground text-sm'>h</span>
              <Select
                value={breakMinutes.toString()}
                onValueChange={handleBreakMinutesChange}
              >
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breakMinuteOptions.map(i => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className='text-muted-foreground text-sm'>m</span>
            </div>
          </div>

          <Button type='submit' size='sm' disabled={saving}>
            {saving ? 'Saving...' : 'Save Work Hours'}
          </Button>
        </form>
      )}

      <p className='text-muted-foreground mt-4 text-xs'>
        These settings help track your work hours and maintain a healthy
        work-life balance.
      </p>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders from parent
export const WorkHoursSection = memo(WorkHoursSectionComponent)
