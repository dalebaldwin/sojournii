import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { ClerkUser } from '@/lib/types'
import Image from 'next/image'

interface WelcomeSectionProps {
  user: ClerkUser
  nextStep: () => void
}

export function WelcomeSection({ user, nextStep }: WelcomeSectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl text-center'>
      <Heading level='h1' weight='normal' className='mb-6' showLines>
        Welcome {user?.firstName || 'there'}
      </Heading>
      {user?.imageUrl && (
        <div className='mb-6 flex justify-center'>
          <Image
            src={user.imageUrl}
            alt={`${user.firstName || 'User'}'s avatar`}
            className='h-[100px] w-[100px] rounded-full object-cover'
            width={100}
            height={100}
          />
        </div>
      )}
      <p className='text-muted-foreground mb-4 text-xl'>
        Welcome to your journey! Let&apos;s get you set up with your
        preferences.
      </p>
      <p className='text-muted-foreground mb-8'>
        We&apos;ll help you configure your timezone and notification preferences
        to make the most of your experience.
      </p>
      <Button onClick={nextStep} size='lg' className='h-16 px-8'>
        <Heading level='none' weight='normal' className='text-lg'>
          Get Started
        </Heading>
      </Button>
    </div>
  )
}
