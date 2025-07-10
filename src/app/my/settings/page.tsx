'use client'

import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { PageHeader } from '@/components/ui/page-header'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import { NotificationSettingsSection } from './sections/NotificationSettingsSection'
import { WorkHoursSection } from './sections/WorkHoursSection'

export default function SettingsPage() {
  const accountSettings = useAccountSettings()

  return (
    <OnboardingGuard>
      <div className='container mx-auto max-w-4xl p-6'>
        <PageHeader
          title='Settings'
          description='Manage your account preferences and work settings.'
          className='mb-6'
        />

        <div className='space-y-6'>
          <NotificationSettingsSection accountSettings={accountSettings} />
          <WorkHoursSection accountSettings={accountSettings} />
        </div>
      </div>
    </OnboardingGuard>
  )
}
