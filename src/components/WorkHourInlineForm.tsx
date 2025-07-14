'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { amPmOptions, hours12 } from '@/lib/welcome-data'
import { useMutation } from 'convex/react'
import { Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

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

interface AccountSettings {
  work_start_hour?: number
  work_start_minute?: number
  work_start_am_pm?: 'AM' | 'PM'
  work_end_hour?: number
  work_end_minute?: number
  work_end_am_pm?: 'AM' | 'PM'
  break_hours?: number
  break_minutes?: number
  default_work_from_home?: boolean
}

interface WorkHourInlineFormProps {
  date: string // YYYY-MM-DD format
  existingEntry?: WorkHourEntry
  defaultSettings?: AccountSettings
  onCancel: () => void
  onSuccess: () => void
}

export function WorkHourInlineForm({
  date,
  existingEntry,
  defaultSettings,
  onCancel,
  onSuccess,
}: WorkHourInlineFormProps) {
  // Work location state
  const [workLocation, setWorkLocation] = useState<
    'home' | 'office' | 'hybrid'
  >('office')

  // Single location time states (for home or office mode)
  const [workStartHour, setWorkStartHour] = useState<number>(9)
  const [workStartMinute, setWorkStartMinute] = useState<number>(0)
  const [workStartAmPm, setWorkStartAmPm] = useState<'AM' | 'PM'>('AM')
  const [workEndHour, setWorkEndHour] = useState<number>(5)
  const [workEndMinute, setWorkEndMinute] = useState<number>(0)
  const [workEndAmPm, setWorkEndAmPm] = useState<'AM' | 'PM'>('PM')

  // Hybrid mode - home time states
  const [homeStartHour, setHomeStartHour] = useState<number>(9)
  const [homeStartMinute, setHomeStartMinute] = useState<number>(0)
  const [homeStartAmPm, setHomeStartAmPm] = useState<'AM' | 'PM'>('AM')
  const [homeEndHour, setHomeEndHour] = useState<number>(12)
  const [homeEndMinute, setHomeEndMinute] = useState<number>(0)
  const [homeEndAmPm, setHomeEndAmPm] = useState<'AM' | 'PM'>('PM')

  // Hybrid mode - office time states
  const [officeStartHour, setOfficeStartHour] = useState<number>(1)
  const [officeStartMinute, setOfficeStartMinute] = useState<number>(0)
  const [officeStartAmPm, setOfficeStartAmPm] = useState<'AM' | 'PM'>('PM')
  const [officeEndHour, setOfficeEndHour] = useState<number>(5)
  const [officeEndMinute, setOfficeEndMinute] = useState<number>(0)
  const [officeEndAmPm, setOfficeEndAmPm] = useState<'AM' | 'PM'>('PM')

  const [breakHours, setBreakHours] = useState<number>(1)
  const [breakMinutes, setBreakMinutes] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const upsertWorkHourEntry = useMutation(api.workHours.upsertWorkHourEntry)

  // Initialize form with existing data or defaults
  useEffect(() => {
    if (existingEntry) {
      // Load existing data
      setWorkLocation(existingEntry.work_location || 'office')

      // Single location times
      if (existingEntry.work_start_hour !== undefined) {
        setWorkStartHour(existingEntry.work_start_hour)
      }
      if (existingEntry.work_start_minute !== undefined) {
        setWorkStartMinute(existingEntry.work_start_minute)
      }
      if (existingEntry.work_start_am_pm) {
        setWorkStartAmPm(existingEntry.work_start_am_pm)
      }
      if (existingEntry.work_end_hour !== undefined) {
        setWorkEndHour(existingEntry.work_end_hour)
      }
      if (existingEntry.work_end_minute !== undefined) {
        setWorkEndMinute(existingEntry.work_end_minute)
      }
      if (existingEntry.work_end_am_pm) {
        setWorkEndAmPm(existingEntry.work_end_am_pm)
      }

      // Hybrid mode - home times
      if (existingEntry.work_home_start_hour !== undefined) {
        setHomeStartHour(existingEntry.work_home_start_hour)
      }
      if (existingEntry.work_home_start_minute !== undefined) {
        setHomeStartMinute(existingEntry.work_home_start_minute)
      }
      if (existingEntry.work_home_start_am_pm) {
        setHomeStartAmPm(existingEntry.work_home_start_am_pm)
      }
      if (existingEntry.work_home_end_hour !== undefined) {
        setHomeEndHour(existingEntry.work_home_end_hour)
      }
      if (existingEntry.work_home_end_minute !== undefined) {
        setHomeEndMinute(existingEntry.work_home_end_minute)
      }
      if (existingEntry.work_home_end_am_pm) {
        setHomeEndAmPm(existingEntry.work_home_end_am_pm)
      }

      // Hybrid mode - office times
      if (existingEntry.work_office_start_hour !== undefined) {
        setOfficeStartHour(existingEntry.work_office_start_hour)
      }
      if (existingEntry.work_office_start_minute !== undefined) {
        setOfficeStartMinute(existingEntry.work_office_start_minute)
      }
      if (existingEntry.work_office_start_am_pm) {
        setOfficeStartAmPm(existingEntry.work_office_start_am_pm)
      }
      if (existingEntry.work_office_end_hour !== undefined) {
        setOfficeEndHour(existingEntry.work_office_end_hour)
      }
      if (existingEntry.work_office_end_minute !== undefined) {
        setOfficeEndMinute(existingEntry.work_office_end_minute)
      }
      if (existingEntry.work_office_end_am_pm) {
        setOfficeEndAmPm(existingEntry.work_office_end_am_pm)
      }

      setBreakHours(existingEntry.break_hours || 0)
      setBreakMinutes(existingEntry.break_minutes || 30)
      setNotes(existingEntry.notes || '')
    } else if (defaultSettings) {
      // Load defaults from account settings
      setWorkLocation(
        defaultSettings.default_work_from_home ? 'home' : 'office'
      )

      if (defaultSettings.work_start_hour !== undefined) {
        const startHour = defaultSettings.work_start_hour
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
      }
      if (defaultSettings.work_start_minute !== undefined) {
        setWorkStartMinute(defaultSettings.work_start_minute)
      }

      if (defaultSettings.work_end_hour !== undefined) {
        const endHour = defaultSettings.work_end_hour
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
      }
      if (defaultSettings.work_end_minute !== undefined) {
        setWorkEndMinute(defaultSettings.work_end_minute)
      }

      setBreakHours(defaultSettings.break_hours || 1)
      setBreakMinutes(defaultSettings.break_minutes || 0)
      setNotes('')
    }
  }, [existingEntry, defaultSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const baseData = {
        date,
        work_location: workLocation,
        break_hours: breakHours,
        break_minutes: breakMinutes,
        work_from_home: workLocation === 'home', // For backward compatibility
        notes: notes.trim() || undefined,
      }

      if (workLocation === 'hybrid') {
        // Submit hybrid work data
        await upsertWorkHourEntry({
          ...baseData,
          work_home_start_hour: homeStartHour,
          work_home_start_minute: homeStartMinute,
          work_home_start_am_pm: homeStartAmPm,
          work_home_end_hour: homeEndHour,
          work_home_end_minute: homeEndMinute,
          work_home_end_am_pm: homeEndAmPm,
          work_office_start_hour: officeStartHour,
          work_office_start_minute: officeStartMinute,
          work_office_start_am_pm: officeStartAmPm,
          work_office_end_hour: officeEndHour,
          work_office_end_minute: officeEndMinute,
          work_office_end_am_pm: officeEndAmPm,
        })
      } else {
        // Submit single location data
        await upsertWorkHourEntry({
          ...baseData,
          work_start_hour: workStartHour,
          work_start_minute: workStartMinute,
          work_start_am_pm: workStartAmPm,
          work_end_hour: workEndHour,
          work_end_minute: workEndMinute,
          work_end_am_pm: workEndAmPm,
        })
      }

      toast.success('Work hours saved successfully')
      onSuccess()
    } catch (error) {
      console.error('Error saving work hours:', error)
      toast.error('Failed to save work hours')
    } finally {
      setIsLoading(false)
    }
  }

  const renderTimeInputs = (
    label: string,
    startHour: number,
    setStartHour: (hour: number) => void,
    startMinute: number,
    setStartMinute: (minute: number) => void,
    startAmPm: 'AM' | 'PM',
    setStartAmPm: (amPm: 'AM' | 'PM') => void,
    endHour: number,
    setEndHour: (hour: number) => void,
    endMinute: number,
    setEndMinute: (minute: number) => void,
    endAmPm: 'AM' | 'PM',
    setEndAmPm: (amPm: 'AM' | 'PM') => void
  ) => (
    <div>
      <Label className='mb-2 block text-sm font-medium'>{label}</Label>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Start Time */}
        <div>
          <Label className='text-muted-foreground mb-1 block text-xs'>
            Start Time
          </Label>
          <div className='flex items-center gap-2'>
            <Select
              value={startHour.toString()}
              onValueChange={value => setStartHour(parseInt(value))}
            >
              <SelectTrigger className='w-20'>
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
            <span className='text-muted-foreground text-sm'>:</span>
            <Input
              type='number'
              min='0'
              max='59'
              value={startMinute}
              onChange={e => setStartMinute(parseInt(e.target.value) || 0)}
              className='w-20'
            />
            <Select
              value={startAmPm}
              onValueChange={value => setStartAmPm(value as 'AM' | 'PM')}
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
          <Label className='text-muted-foreground mb-1 block text-xs'>
            End Time
          </Label>
          <div className='flex items-center gap-2'>
            <Select
              value={endHour.toString()}
              onValueChange={value => setEndHour(parseInt(value))}
            >
              <SelectTrigger className='w-20'>
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
            <span className='text-muted-foreground text-sm'>:</span>
            <Input
              type='number'
              min='0'
              max='59'
              value={endMinute}
              onChange={e => setEndMinute(parseInt(e.target.value) || 0)}
              className='w-20'
            />
            <Select
              value={endAmPm}
              onValueChange={value => setEndAmPm(value as 'AM' | 'PM')}
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
  )

  return (
    <div className='bg-muted/30 -mx-4 -mb-4 space-y-4 rounded-b-lg border-t px-4 pt-4 pb-4'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Work Location */}
        <div>
          <Label className='mb-2 block text-sm font-medium'>
            Work Location
          </Label>
          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant={workLocation === 'home' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setWorkLocation('home')}
            >
              🏠 Home
            </Button>
            <Button
              type='button'
              variant={workLocation === 'office' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setWorkLocation('office')}
            >
              🏢 Office
            </Button>
            <Button
              type='button'
              variant={workLocation === 'hybrid' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setWorkLocation('hybrid')}
            >
              🔄 Hybrid
            </Button>
          </div>
        </div>

        {/* Work Schedule - Conditional based on location */}
        {workLocation === 'hybrid' ? (
          <div className='space-y-4'>
            {renderTimeInputs(
              'Home Work Schedule',
              homeStartHour,
              setHomeStartHour,
              homeStartMinute,
              setHomeStartMinute,
              homeStartAmPm,
              setHomeStartAmPm,
              homeEndHour,
              setHomeEndHour,
              homeEndMinute,
              setHomeEndMinute,
              homeEndAmPm,
              setHomeEndAmPm
            )}
            {renderTimeInputs(
              'Office Work Schedule',
              officeStartHour,
              setOfficeStartHour,
              officeStartMinute,
              setOfficeStartMinute,
              officeStartAmPm,
              setOfficeStartAmPm,
              officeEndHour,
              setOfficeEndHour,
              officeEndMinute,
              setOfficeEndMinute,
              officeEndAmPm,
              setOfficeEndAmPm
            )}
          </div>
        ) : (
          renderTimeInputs(
            'Work Schedule',
            workStartHour,
            setWorkStartHour,
            workStartMinute,
            setWorkStartMinute,
            workStartAmPm,
            setWorkStartAmPm,
            workEndHour,
            setWorkEndHour,
            workEndMinute,
            setWorkEndMinute,
            workEndAmPm,
            setWorkEndAmPm
          )
        )}

        {/* Break Time */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Break Time</Label>
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              min='0'
              max='24'
              value={breakHours}
              onChange={e => setBreakHours(parseInt(e.target.value) || 0)}
              placeholder='1'
              className='w-20'
            />
            <span className='text-muted-foreground text-sm'>h</span>
            <Input
              type='number'
              min='0'
              max='59'
              value={breakMinutes}
              onChange={e => setBreakMinutes(parseInt(e.target.value) || 0)}
              placeholder='0'
              className='w-20'
            />
            <span className='text-muted-foreground text-sm'>m</span>
          </div>
          <div className='text-muted-foreground text-xs'>
            Total break time for the day
          </div>
        </div>

        {/* Notes */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder='Any additional notes about your work day...'
            rows={3}
            className='resize-none'
          />
        </div>

        {/* Actions */}
        <div className='flex justify-end space-x-2 pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className='mr-2 h-4 w-4' />
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            <Save className='mr-2 h-4 w-4' />
            {isLoading ? 'Saving...' : 'Save Hours'}
          </Button>
        </div>
      </form>
    </div>
  )
}
