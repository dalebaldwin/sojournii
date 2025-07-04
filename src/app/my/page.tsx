'use client'

import { Heading } from '@/components/ui/heading'

export default function DashboardPage() {
  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Heading level='h1' weight='bold' className='mb-2' showLines>
          Dashboard
        </Heading>
        <p className='text-muted-foreground'>
          Welcome to your Sojournii dashboard.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <div className='bg-muted rounded-lg p-6'>
          <Heading level='h3' weight='bold' className='mb-2' showLines>
            Weekly Reminders
          </Heading>
          <p className='text-muted-foreground text-sm'>
            Your next reminder will be sent on Friday at 4:00 PM.
          </p>
        </div>

        <div className='bg-muted rounded-lg p-6'>
          <Heading level='h3' weight='bold' className='mb-2'>
            Account Status
          </Heading>
          <p className='text-muted-foreground text-sm'>
            Your account is active and ready to use.
          </p>
        </div>

        <div className='bg-muted rounded-lg p-6'>
          <Heading level='h3' weight='bold' className='mb-2'>
            Quick Actions
          </Heading>
          <p className='text-muted-foreground text-sm'>
            Manage your settings and account preferences.
          </p>
        </div>
      </div>
    </div>
  )
}
