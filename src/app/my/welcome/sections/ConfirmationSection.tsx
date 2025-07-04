import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { ClerkUser, Timezone } from '@/lib/types'
import { WelcomeData } from '@/lib/welcome-data'

interface ConfirmationSectionProps {
  welcomeData: WelcomeData
  user: ClerkUser
  selectedTimezone: Timezone | undefined
  prevStep: () => void
  handleSave: () => void
  saving: boolean
}

export function ConfirmationSection({
  welcomeData,
  user,
  selectedTimezone,
  prevStep,
  handleSave,
  saving,
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
            <h3 className='mb-2 font-semibold'>Account Information</h3>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Name:</span>{' '}
              {user?.firstName} {user?.lastName}
            </p>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Account Email:</span>{' '}
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className='bg-muted rounded-lg p-4'>
            <h3 className='mb-2 font-semibold'>Notification Preferences</h3>
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
