'use client'

import { Heading } from '@/components/ui/heading'
import { UserProfile } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'

export default function AccountsPage() {
  const { resolvedTheme } = useTheme()

  return (
    <div className='p-6'>
      <div className='mb-6'>
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
  )
}
