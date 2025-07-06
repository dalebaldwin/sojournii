'use client'

import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { Heading } from '@/components/ui/heading'
import { UserProfile } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'

export default function AccountsPage() {
  const { resolvedTheme } = useTheme()

  return (
    <OnboardingGuard>
      <div className='flex min-h-screen items-center justify-center p-6'>
        <div className='w-full max-w-4xl'>
          <div className='mb-6 text-center'>
            <Heading level='h1' weight='bold' className='mb-2'>
              Account Settings
            </Heading>
            <p className='text-muted-foreground'>
              Manage your account information and preferences.
            </p>
          </div>

          <div>
            <UserProfile
              appearance={{
                baseTheme: resolvedTheme === 'dark' ? dark : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </OnboardingGuard>
  )
}
