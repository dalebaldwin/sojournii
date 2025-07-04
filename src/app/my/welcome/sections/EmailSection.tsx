import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Label } from '@/components/ui/label'
import { ClerkUser, WelcomeData } from '@/lib/types'

interface EmailSectionProps {
  welcomeData: WelcomeData
  nextStep: () => void
  prevStep: () => void
  user: ClerkUser
  emailError: string
  handleEmailChange: (email: string) => void
}

export function EmailSection({
  welcomeData,
  nextStep,
  prevStep,
  user,
  emailError,
  handleEmailChange,
}: EmailSectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Notification Email
        </Heading>
        <p className='text-muted-foreground'>
          Choose which email address to use for your weekly reminders.
        </p>
      </div>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <p className='text-muted-foreground text-sm'>
            We can send your weekly reminders to a different email address than
            your account email, such as your work email. You can change this
            address at any time in your settings.
          </p>
          <div className='space-y-2'>
            <Label htmlFor='notification-email'>
              Weekly Notification Email
            </Label>
            <input
              id='notification-email'
              type='email'
              value={welcomeData.notifications_email}
              onChange={e => handleEmailChange(e.target.value)}
              placeholder={
                user?.primaryEmailAddress?.emailAddress || 'Enter email address'
              }
              className={`ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-4 py-3 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-input bg-background'}`}
            />
            {emailError && <p className='text-sm text-red-500'>{emailError}</p>}
          </div>
          <div className='text-center'>
            <Button
              variant='outline'
              onClick={() => {
                handleEmailChange(user?.primaryEmailAddress?.emailAddress || '')
              }}
              className='text-sm'
            >
              Use Account Email
            </Button>
          </div>
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
