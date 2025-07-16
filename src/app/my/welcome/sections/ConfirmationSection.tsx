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
              <Button
                variant='link'
                size='sm'
                onClick={() => goToStep('reminders')}
                className='text-primary h-auto p-0 text-xs'
              >
                Change
              </Button>
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
              <Button
                variant='link'
                size='sm'
                onClick={() => goToStep('workHours')}
                className='text-primary h-auto p-0 text-xs'
              >
                Change
              </Button>
            </div>
            <p className='text-sm'>
              <span className='text-muted-foreground'>
                Work Hours Per Week:
              </span>{' '}
              {welcomeData.work_hours}h {welcomeData.work_minutes}m
            </p>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Work Schedule:</span>{' '}
              {welcomeData.work_start_hour}:
              {welcomeData.work_start_minute.toString().padStart(2, '0')}{' '}
              {welcomeData.work_start_am_pm} - {welcomeData.work_end_hour}:
              {welcomeData.work_end_minute.toString().padStart(2, '0')}{' '}
              {welcomeData.work_end_am_pm}
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

          {/* Only show employer section if user has entered employer data */}
          {welcomeData.employers &&
            welcomeData.employers.length > 0 &&
            welcomeData.employers.some(
              emp =>
                emp.employer_name.trim() &&
                emp.start_year &&
                emp.start_month &&
                emp.start_day
            ) && (
              <div className='bg-muted rounded-lg p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='font-semibold'>Employer Information</h3>
                  <Button
                    variant='link'
                    size='sm'
                    onClick={() => goToStep('employer')}
                    className='text-primary h-auto p-0 text-xs'
                  >
                    Change
                  </Button>
                </div>
                <div className='space-y-2'>
                  {welcomeData.employers
                    .filter(
                      emp =>
                        emp.employer_name.trim() &&
                        emp.start_year &&
                        emp.start_month &&
                        emp.start_day
                    )
                    .map((employer, index) => (
                      <div key={index} className='text-sm'>
                        <span className='font-medium'>
                          {employer.employer_name}
                        </span>
                        <span className='text-muted-foreground ml-2'>
                          Started {employer.start_month}/{employer.start_day}/
                          {employer.start_year}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>

        <div className='flex justify-between'>
          <Button variant='outline' onClick={prevStep}>
            Previous
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
