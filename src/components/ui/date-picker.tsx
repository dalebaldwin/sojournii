'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatTimestampInTimezone } from '@/lib/time-functions'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
  userTimezone?: string // Optional timezone for timezone-aware formatting
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  minDate,
  maxDate,
  userTimezone,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Format the date display - use timezone-aware formatting if timezone is provided
  const formatDateDisplay = (date: Date) => {
    if (userTimezone) {
      return formatTimestampInTimezone(date.getTime(), userTimezone, 'PPP')
    }
    return format(date, 'PPP')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'h-12 w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? formatDateDisplay(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={selectedDate => {
            onDateChange?.(selectedDate)
            setOpen(false)
          }}
          disabled={date => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
