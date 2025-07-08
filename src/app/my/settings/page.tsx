'use client'

import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { Heading } from '@/components/ui/heading'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import { NotificationSettingsSection } from './sections/NotificationSettingsSection'
import { PerformanceQuestionsSection } from './sections/PerformanceQuestionsSection'
import { WorkHoursSection } from './sections/WorkHoursSection'

export default function SettingsPage() {
  const accountSettings = useAccountSettings()

  return (
    <OnboardingGuard>
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='mb-6'>
          <Heading level='h1' weight='bold'>
            Settings
          </Heading>
          <p className='text-muted-foreground mt-2'>
            Manage your account preferences and work settings.
          </p>
        </div>

        <div className='space-y-6'>
          <NotificationSettingsSection accountSettings={accountSettings} />
          <WorkHoursSection accountSettings={accountSettings} />
          <PerformanceQuestionsSection accountSettings={accountSettings} />
        </div>
      </div>
    </OnboardingGuard>
  )
}
