'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useAccountSettings,
  useCreateAccountSettings,
  useUpdateAccountSettings,
} from '@/hooks/useAccountSettings'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

type FormData = {
  email: string
  onboarding_completed: boolean
  weekly_reminder: boolean
  weekly_reminder_hour: number
  weekly_reminder_minute: number
  weekly_reminder_day:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  weekly_reminder_time_zone: string
}

export function AccountSettingsForm() {
  const { user } = useUser()
  const { data: settings, isLoading, error } = useAccountSettings()
  const createSettings = useCreateAccountSettings()
  const updateSettings = useUpdateAccountSettings()

  const [formData, setFormData] = useState<FormData>({
    email: user?.emailAddresses[0]?.emailAddress || '',
    onboarding_completed: false,
    weekly_reminder: true,
    weekly_reminder_hour: 9,
    weekly_reminder_minute: 0,
    weekly_reminder_day: 'monday',
    weekly_reminder_time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (settings && typeof settings === 'object' && '_id' in settings) {
      // Update existing settings
      await updateSettings.mutateAsync({
        id: (settings as any)._id,
        ...formData,
      })
    } else {
      // Create new settings
      await createSettings.mutateAsync(formData)
    }
  }

  if (isLoading) {
    return <div>Loading account settings...</div>
  }

  if (error) {
    return <div>Error loading account settings: {error.message}</div>
  }

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='onboarding'>Onboarding Completed</Label>
            <Select
              value={formData.onboarding_completed.toString()}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  onboarding_completed: value === 'true',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='true'>Yes</SelectItem>
                <SelectItem value='false'>No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='weekly_reminder'>Weekly Reminders</Label>
            <Select
              value={formData.weekly_reminder.toString()}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  weekly_reminder: value === 'true',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='true'>Enabled</SelectItem>
                <SelectItem value='false'>Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.weekly_reminder && (
            <>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='hour'>Hour</Label>
                  <Input
                    id='hour'
                    type='number'
                    min='0'
                    max='23'
                    value={formData.weekly_reminder_hour}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        weekly_reminder_hour: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='minute'>Minute</Label>
                  <Input
                    id='minute'
                    type='number'
                    min='0'
                    max='59'
                    value={formData.weekly_reminder_minute}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        weekly_reminder_minute: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='day'>Day of Week</Label>
                <Select
                  value={formData.weekly_reminder_day}
                  onValueChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      weekly_reminder_day:
                        value as FormData['weekly_reminder_day'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='monday'>Monday</SelectItem>
                    <SelectItem value='tuesday'>Tuesday</SelectItem>
                    <SelectItem value='wednesday'>Wednesday</SelectItem>
                    <SelectItem value='thursday'>Thursday</SelectItem>
                    <SelectItem value='friday'>Friday</SelectItem>
                    <SelectItem value='saturday'>Saturday</SelectItem>
                    <SelectItem value='sunday'>Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            type='submit'
            disabled={createSettings.isPending || updateSettings.isPending}
            className='w-full'
          >
            {createSettings.isPending || updateSettings.isPending
              ? 'Saving...'
              : 'Save Settings'}
          </Button>
        </form>

        {settings && (
          <div className='bg-muted mt-6 rounded-lg p-4'>
            <h3 className='mb-2 font-semibold'>Current Settings</h3>
            <pre className='overflow-auto text-sm'>
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
