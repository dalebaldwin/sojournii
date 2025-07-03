'use client'

import { AccountSettingsForm } from '@/components/account-settings-form'
import { UserButton, useUser } from '@clerk/nextjs'

export default function MyDashboardPage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <p className='text-muted-foreground font-sans'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <p className='text-muted-foreground font-sans'>
            Please sign in to access your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='font-display text-foreground text-3xl font-bold'>
          My Dashboard
        </h1>
        <UserButton />
      </div>

      <div className='bg-card rounded-lg border p-6 shadow'>
        <h2 className='font-display text-foreground mb-4 text-xl font-semibold'>
          Welcome to your protected area!
        </h2>
        <p className='text-muted-foreground mb-4 font-sans'>
          This is your personal dashboard. Only authenticated users can access
          this area.
        </p>

        <div className='bg-accent mt-4 rounded-md p-4'>
          <p className='text-accent-foreground font-mono text-sm'>
            <strong>Clerk User ID:</strong> {user.id}
          </p>
          <p className='text-accent-foreground mt-2 font-mono text-sm'>
            <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        <div className='mt-6'>
          <a
            href='/my/welcome'
            className='border-border text-card-foreground bg-card hover:bg-accent inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors'
          >
            View Welcome Page
          </a>
        </div>
      </div>

      <AccountSettingsForm />
    </div>
  )
}
