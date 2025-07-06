'use client'

import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { Heading } from '@/components/ui/heading'
import { useAccountSettings } from '@/hooks/useAccountSettings'

export default function DashboardPage() {
  const accountSettings = useAccountSettings()

  return (
    <OnboardingGuard>
      {!accountSettings ? (
        <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
          Loading...
        </div>
      ) : (
        <div className='p-6'>
          <div className='mb-6'>
            <Heading level='h1' weight='bold' className='mb-2'>
              Dashboard
            </Heading>
            <p className='text-muted-foreground'>
              Welcome to your Sojournii dashboard.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='rounded-lg border p-4'>
              <h3 className='mb-2 font-semibold'>Account Information</h3>
              <p className='text-muted-foreground text-sm'>
                Email: {accountSettings.notifications_email}
              </p>
              <p className='text-muted-foreground text-sm'>
                Timezone: {accountSettings.weekly_reminder_time_zone}
              </p>
            </div>

            <div className='rounded-lg border p-4'>
              <h3 className='mb-2 font-semibold'>Performance Questions</h3>
              <p className='text-muted-foreground text-sm'>
                {accountSettings.perf_questions?.length || 0} questions
                configured
              </p>
            </div>

            <div className='rounded-lg border p-4'>
              <h3 className='mb-2 font-semibold'>Work Hours</h3>
              <p className='text-muted-foreground text-sm'>
                {accountSettings.work_hours || 0}h{' '}
                {accountSettings.work_minutes || 0}m per week
              </p>
              <p className='text-muted-foreground text-sm'>
                Default location:{' '}
                {accountSettings.default_work_from_home ? 'Home' : 'Office'}
              </p>
            </div>
          </div>
        </div>
      )}
    </OnboardingGuard>
  )
}
