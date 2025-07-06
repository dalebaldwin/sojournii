import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Timezone } from '@/lib/types'
import { WelcomeData } from '@/lib/welcome-data'

interface ConfirmationSectionProps {
  welcomeData: WelcomeData
  selectedTimezone: Timezone | undefined
  prevStep: () => void
  handleSave: () => void
  saving: boolean
  goToStep: (step: string) => void
}

export function ConfirmationSection({
  welcomeData,
  selectedTimezone,
  prevStep,
  handleSave,
  saving,
  goToStep,
}: ConfirmationSectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Confirm Your Settings
        </Heading>
        <p className='text-muted-foreground'>
          Please review your preferences before we save them.
        </p>
      </div>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <div className='bg-muted rounded-lg p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='font-semibold'>Notification Preferences</h3>
              <button
                onClick={() => goToStep('reminders')}
                className='text-primary text-xs hover:underline'
              >
                Change
              </button>
            </div>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Notification Email:</span>{' '}
              {welcomeData.notifications_email}
            </p>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Weekly Reminders:</span>{' '}
              Every{' '}
              {welcomeData.weekly_reminder_day.charAt(0).toUpperCase() +
                welcomeData.weekly_reminder_day.slice(1)}{' '}
              at {welcomeData.weekly_reminder_hour}:
              {welcomeData.weekly_reminder_minute.toString().padStart(2, '0')}{' '}
              {welcomeData.weekly_reminder_am_pm}
            </p>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Timezone:</span>{' '}
              {selectedTimezone?.city}, {selectedTimezone?.country}
            </p>
          </div>
          <div className='bg-muted rounded-lg p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='font-semibold'>Work Hours</h3>
              <button
                onClick={() => goToStep('workHours')}
                className='text-primary text-xs hover:underline'
              >
                Change
              </button>
            </div>
            <p className='text-sm'>
              <span className='text-muted-foreground'>
                Work Hours Per Week:
              </span>{' '}
              {welcomeData.work_hours}h {welcomeData.work_minutes}m
            </p>
            <p className='text-sm'>
              <span className='text-muted-foreground'>
                Default Work Location:
              </span>{' '}
              {welcomeData.default_work_from_home ? 'Home' : 'Office'}
            </p>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Daily Break Time:</span>{' '}
              {welcomeData.break_hours}h {welcomeData.break_minutes}m
            </p>
          </div>
          {welcomeData.employers && welcomeData.employers.length > 0 && (
            <div className='bg-muted rounded-lg p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <h3 className='font-semibold'>Employer Information</h3>
                <button
                  onClick={() => goToStep('employer')}
                  className='text-primary text-xs hover:underline'
                >
                  Change
                </button>
              </div>
              {welcomeData.employers.map((employer, index) => (
                <div key={index} className='mb-2 last:mb-0'>
                  <p className='text-sm'>
                    <span className='text-muted-foreground'>
                      {index === 0
                        ? 'Current Employer:'
                        : `Previous Employer ${index + 1}:`}
                    </span>{' '}
                    {employer.employer_name}
                  </p>
                  <p className='text-sm'>
                    <span className='text-muted-foreground'>Start Date:</span>{' '}
                    {employer.start_month}/{employer.start_day}/
                    {employer.start_year}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className='bg-muted rounded-lg p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='font-semibold'>Performance Questions</h3>
              <button
                onClick={() => goToStep('performanceQuestions')}
                className='text-primary text-xs hover:underline'
              >
                Preview
              </button>
            </div>
            <p className='text-sm'>
              <span className='text-muted-foreground'>
                Number of Questions:
              </span>{' '}
              {welcomeData.performanceQuestions.length} questions
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              Using default performance questions that can be customized later
              in settings.
            </p>
          </div>
        </div>
        <div className='flex justify-between'>
          <Button variant='ghost' onClick={prevStep} disabled={saving}>
            Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
