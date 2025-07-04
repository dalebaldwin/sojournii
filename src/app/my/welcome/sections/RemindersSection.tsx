import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Timezone, WelcomeData } from '@/lib/types'
import { amPmOptions, daysOfWeek, hours12, minutes } from '@/lib/welcome-data'

interface RemindersSectionProps {
  welcomeData: WelcomeData
  setWelcomeData: (fn: (prev: WelcomeData) => WelcomeData) => void
  nextStep: () => void
  prevStep: () => void
  selectedTimezone: Timezone | undefined
}

export function RemindersSection({
  welcomeData,
  setWelcomeData,
  nextStep,
  prevStep,
  selectedTimezone,
}: RemindersSectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Weekly Reminders
        </Heading>
        <p className='text-muted-foreground'>
          Set up your preferred time for weekly reminders and updates.
        </p>
      </div>
      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='space-y-2'>
            <Label>Day of Week</Label>
            <Select
              value={welcomeData.weekly_reminder_day}
              onValueChange={value =>
                setWelcomeData(prev => ({
                  ...prev,
                  weekly_reminder_day:
                    value as WelcomeData['weekly_reminder_day'],
                }))
              }
            >
              <SelectTrigger className='h-12 text-base'>
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
          <div className='space-y-2'>
            <Label>Time</Label>
            <div className='grid grid-cols-3 gap-2'>
              <Select
                value={welcomeData.weekly_reminder_hour.toString()}
                onValueChange={value =>
                  setWelcomeData(prev => ({
                    ...prev,
                    weekly_reminder_hour: parseInt(value),
                  }))
                }
              >
                <SelectTrigger className='h-12 text-base'>
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
              <Select
                value={welcomeData.weekly_reminder_minute.toString()}
                onValueChange={value =>
                  setWelcomeData(prev => ({
                    ...prev,
                    weekly_reminder_minute: parseInt(value),
                  }))
                }
              >
                <SelectTrigger className='h-12 text-base'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map(minute => (
                    <SelectItem
                      key={minute.value}
                      value={minute.value.toString()}
                    >
                      {minute.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={welcomeData.weekly_reminder_am_pm}
                onValueChange={value =>
                  setWelcomeData(prev => ({
                    ...prev,
                    weekly_reminder_am_pm: value as 'AM' | 'PM',
                  }))
                }
              >
                <SelectTrigger className='h-12 text-base'>
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
        <div className='bg-muted rounded-lg p-4'>
          <p className='text-muted-foreground text-sm'>
            You&apos;ll receive weekly reminders every{' '}
            <span className='font-medium'>
              {
                daysOfWeek.find(
                  d => d.value === welcomeData.weekly_reminder_day
                )?.label
              }
            </span>{' '}
            at{' '}
            <span className='font-medium'>
              {welcomeData.weekly_reminder_hour}:
              {welcomeData.weekly_reminder_minute.toString().padStart(2, '0')}{' '}
              {welcomeData.weekly_reminder_am_pm}
            </span>{' '}
            in your timezone ({selectedTimezone?.city},{' '}
            {selectedTimezone?.country}).
          </p>
        </div>
        <div className='flex justify-between'>
          <Button variant='ghost' onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>Next</Button>
        </div>
      </div>
    </div>
  )
}
