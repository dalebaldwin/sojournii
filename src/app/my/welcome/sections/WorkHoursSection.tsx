import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Label } from '@/components/ui/label'
import { WelcomeData } from '@/lib/welcome-data'

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

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Work Hours
        </Heading>
        <p className='text-muted-foreground'>
          We need your work hours to help you keep track of your time and ensure
          you&apos;re maintaining a healthy work-life balance.
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
              <input
                id='work-hours'
                type='number'
                min='0'
                max='168'
                value={welcomeData.work_hours}
                onChange={e => handleWorkHoursChange(Number(e.target.value))}
                className='w-20 rounded border px-3 py-2'
              />
              <span className='text-muted-foreground text-sm'>h</span>
              <input
                type='number'
                min='0'
                max='59'
                value={welcomeData.work_minutes}
                onChange={e => handleWorkMinutesChange(Number(e.target.value))}
                className='w-20 rounded border px-3 py-2'
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
            This will be your default work location for new time entries
          </p>
        </div>

        {/* Breaks */}
        <div className='space-y-2'>
          <Label>Daily Break Time</Label>
          <div className='flex items-center gap-2'>
            <select
              value={welcomeData.break_hours}
              onChange={e => handleBreakHoursChange(Number(e.target.value))}
              className='rounded border px-3 py-2'
            >
              {Array.from({ length: maxBreakHours + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <span className='text-muted-foreground text-sm'>hours</span>
            <select
              value={welcomeData.break_minutes}
              onChange={e => handleBreakMinutesChange(Number(e.target.value))}
              className='rounded border px-3 py-2'
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className='text-muted-foreground text-sm'>minutes</span>
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
