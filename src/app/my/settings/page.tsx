'use client'

import { Heading } from '@/components/ui/heading'

export default function SettingsPage() {
  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Heading level='h1' weight='bold' className='mb-2'>
          Settings
        </Heading>
        <p className='text-muted-foreground'>
          Customize your notification preferences and other settings.
        </p>
      </div>

      <div className='max-w-2xl space-y-6'>
        <div className='bg-muted rounded-lg p-6'>
          <Heading level='h2' weight='bold' className='mb-4'>
            Notification Settings
          </Heading>
          <p className='text-muted-foreground'>
            Configure your weekly reminder preferences, timezone, and
            notification email address.
          </p>
          <p className='text-muted-foreground mt-2 text-sm'>
            Settings forms will be added here soon.
          </p>
        </div>

        <div className='bg-muted rounded-lg p-6'>
          <Heading level='h2' weight='bold' className='mb-4'>
            Other Preferences
          </Heading>
          <p className='text-muted-foreground'>
            Additional customization options will be available here.
          </p>
        </div>
      </div>
    </div>
  )
}
