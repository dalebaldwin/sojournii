import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WelcomeData, amPmOptions, hours12 } from '@/lib/welcome-data'

interface WorkHoursSectionProps {
  welcomeData: WelcomeData
  setWelcomeData: (data: WelcomeData) => void
  nextStep: () => void
  prevStep: () => void
}

export function WorkHoursSection({
  welcomeData,
  setWelcomeData,
  nextStep,
  prevStep,
}: WorkHoursSectionProps) {
  const maxBreakHours = Math.floor(
    (welcomeData.work_hours * 60 + welcomeData.work_minutes) / 5
  )

  const handleWorkHoursChange = (hours: number) => {
    setWelcomeData({
      ...welcomeData,
      work_hours: hours,
      // Reset break hours if they exceed the new maximum
      break_hours: Math.min(
        welcomeData.break_hours,
        Math.floor((hours * 60 + welcomeData.work_minutes) / 5)
      ),
    })
  }

  const handleWorkMinutesChange = (minutes: number) => {
    setWelcomeData({
      ...welcomeData,
      work_minutes: minutes,
      // Reset break hours if they exceed the new maximum
      break_hours: Math.min(
        welcomeData.break_hours,
        Math.floor((welcomeData.work_hours * 60 + minutes) / 5)
      ),
    })
  }

  const handleBreakHoursChange = (hours: number) => {
    setWelcomeData({
      ...welcomeData,
      break_hours: hours,
    })
  }

  const handleBreakMinutesChange = (minutes: number) => {
    setWelcomeData({
      ...welcomeData,
      break_minutes: minutes,
    })
  }

  const handleWorkFromHomeChange = (workFromHome: boolean) => {
    setWelcomeData({
      ...welcomeData,
      default_work_from_home: workFromHome,
    })
  }

  const handleStartTimeChange = (field: string, value: number | string) => {
    setWelcomeData({
      ...welcomeData,
      [field]: value,
    })
  }

  const handleEndTimeChange = (field: string, value: number | string) => {
    setWelcomeData({
      ...welcomeData,
      [field]: value,
    })
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Work Hours
        </Heading>
        <p className='text-muted-foreground'>
          Let&apos;s setup your default work hours, schedule, and break time.
          Don&apos;t worry if your day fluctuates - these are just our default
          starting points.
        </p>
      </div>

      <div className='space-y-6'>
        {/* Work Hours Per Week and Default Work Location */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='work-hours'>Work Hours Per Week</Label>
            <Label>Work Location</Label>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Input
                id='work-hours'
                type='number'
                min='0'
                max='168'
                value={welcomeData.work_hours.toString()}
                onChange={e => handleWorkHoursChange(Number(e.target.value))}
                className='h-10 w-20'
              />
              <span className='text-muted-foreground text-sm'>h</span>
              <Input
                type='number'
                min='0'
                max='59'
                value={welcomeData.work_minutes.toString()}
                onChange={e => handleWorkMinutesChange(Number(e.target.value))}
                className='h-10 w-20'
              />
              <span className='text-muted-foreground text-sm'>m</span>
            </div>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => handleWorkFromHomeChange(false)}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                  !welcomeData.default_work_from_home
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Office
              </button>
              <button
                type='button'
                onClick={() => handleWorkFromHomeChange(true)}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                  welcomeData.default_work_from_home
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Home
              </button>
            </div>
          </div>
          <p className='text-muted-foreground text-xs'>
            This will be your default work location for new time entries, please
            base this on your contract so we can help you keep track of if you
            are going over or under.
          </p>
        </div>

        {/* Work Schedule - Start and End Times */}
        <div className='space-y-4'>
          <Label>Daily Work Schedule</Label>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Start Time */}
            <div className='space-y-2'>
              <Label className='text-sm'>Start Time</Label>
              <div className='flex items-center gap-2'>
                <Select
                  value={welcomeData.work_start_hour.toString()}
                  onValueChange={value =>
                    handleStartTimeChange('work_start_hour', parseInt(value))
                  }
                >
                  <SelectTrigger className='h-10 w-20'>
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
                  value={welcomeData.work_start_minute.toString()}
                  onChange={e =>
                    handleStartTimeChange(
                      'work_start_minute',
                      parseInt(e.target.value)
                    )
                  }
                  className='h-10 w-20'
                />
                <span className='text-muted-foreground text-sm'>m</span>
                <Select
                  value={welcomeData.work_start_am_pm}
                  onValueChange={value =>
                    handleStartTimeChange('work_start_am_pm', value)
                  }
                >
                  <SelectTrigger className='h-10 w-20'>
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
            <div className='space-y-2'>
              <Label className='text-sm'>End Time</Label>
              <div className='flex items-center gap-2'>
                <Select
                  value={welcomeData.work_end_hour.toString()}
                  onValueChange={value =>
                    handleEndTimeChange('work_end_hour', parseInt(value))
                  }
                >
                  <SelectTrigger className='h-10 w-20'>
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
                  value={welcomeData.work_end_minute.toString()}
                  onChange={e =>
                    handleEndTimeChange(
                      'work_end_minute',
                      parseInt(e.target.value)
                    )
                  }
                  className='h-10 w-20'
                />
                <span className='text-muted-foreground text-sm'>m</span>
                <Select
                  value={welcomeData.work_end_am_pm}
                  onValueChange={value =>
                    handleEndTimeChange('work_end_am_pm', value)
                  }
                >
                  <SelectTrigger className='h-10 w-20'>
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

          <p className='text-muted-foreground text-xs'>
            Your typical daily start and end times - these will be used as
            defaults for new time entries.
          </p>
        </div>

        {/* Breaks */}
        <div className='space-y-2'>
          <Label>Daily Break Time</Label>
          <div className='flex items-center gap-2'>
            <Select
              value={welcomeData.break_hours.toString()}
              onValueChange={value => handleBreakHoursChange(Number(value))}
            >
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxBreakHours + 1 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-muted-foreground text-sm'>h</span>
            <Select
              value={welcomeData.break_minutes.toString()}
              onValueChange={value => handleBreakMinutesChange(Number(value))}
            >
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-muted-foreground text-sm'>m</span>
          </div>
          <p className='text-muted-foreground text-xs'>
            Total break time per day (lunch, coffee breaks, etc.)
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
