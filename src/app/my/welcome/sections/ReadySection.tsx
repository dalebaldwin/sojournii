import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import Link from 'next/link'

interface ReadySectionProps {
  onGetStarted: () => void
}

export function ReadySection({ onGetStarted }: ReadySectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl text-center'>
      <div className='mb-8'>
        <Heading level='h2' weight='bold' className='mb-4' showLines>
          Welcome to Sojournii!
        </Heading>
        <p className='text-muted-foreground text-lg'>
          Your account has been set up successfully. You&apos;re all ready to
          start your performance journey.
        </p>
      </div>

      <div className='mb-8 space-y-4'>
        <div className='bg-muted/50 rounded-lg p-6'>
          <h3 className='mb-3 font-semibold'>What&apos;s Next?</h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            You can further customize your Sojournii experience by adjusting
            your settings anytime.
          </p>
          <Link href='/my/settings'>
            <Button variant='outline' className='w-full'>
              Go to Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className='space-y-4'>
        <Button onClick={onGetStarted} size='lg' className='w-full'>
          Get Started
        </Button>
        <p className='text-muted-foreground text-xs'>
          You can always access settings later from your dashboard
        </p>
      </div>
    </div>
  )
}
