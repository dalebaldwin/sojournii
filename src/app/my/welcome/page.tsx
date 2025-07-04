'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Heading } from '@/components/ui/heading'
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
} from '@/hooks/useAccountSettings'
import { findTimezone, getUserTimezone, timezones } from '@/lib/timezones'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type WelcomeStep =
  | 'welcome'
  | 'timezone'
  | 'reminders'
  | 'email'
  | 'confirmation'

interface WelcomeData {
  clerk_email: string
  notifications_email: string
  timezone: string
  weekly_reminder_day:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  weekly_reminder_hour: number
  weekly_reminder_minute: number
  weekly_reminder_am_pm: 'AM' | 'PM'
}

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const

const hours12 = [
  { value: 12, label: '12' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: '11' },
]

const minutes = [
  { value: 0, label: '00' },
  { value: 15, label: '15' },
  { value: 30, label: '30' },
  { value: 45, label: '45' },
]

const amPmOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
]

// Convert 12-hour time to 24-hour time
const convertTo24Hour = (hour: number, amPm: 'AM' | 'PM'): number => {
  if (amPm === 'AM') {
    return hour === 12 ? 0 : hour
  } else {
    return hour === 12 ? 12 : hour + 12
  }
}

// Convert 24-hour time to 12-hour time
const convertTo12Hour = (
  hour24: number
): { hour: number; amPm: 'AM' | 'PM' } => {
  if (hour24 === 0) return { hour: 12, amPm: 'AM' }
  if (hour24 === 12) return { hour: 12, amPm: 'PM' }
  if (hour24 > 12) return { hour: hour24 - 12, amPm: 'PM' }
  return { hour: hour24, amPm: 'AM' }
}

export default function WelcomePage() {
  const { user, isLoaded } = useUser()
  const { isAuthenticated } = useConvexAuth()
  const router = useRouter()
  const createSettings = useCreateAccountSettings()
  const accountSettings = useAccountSettings()

  const userTimezone = getUserTimezone()
  const initial12Hour = convertTo12Hour(16) // Default to 4 PM (Friday 4:30 PM)

  const [currentStep, setCurrentStep] = useState<WelcomeStep>('welcome')
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [welcomeData, setWelcomeData] = useState<WelcomeData>({
    clerk_email: '', // Will be set from Clerk when needed
    notifications_email: user?.primaryEmailAddress?.emailAddress || '', // Pre-fill with user's email
    timezone: userTimezone,
    weekly_reminder_day: 'friday',
    weekly_reminder_hour: initial12Hour.hour,
    weekly_reminder_minute: 30,
    weekly_reminder_am_pm: initial12Hour.amPm,
  })

  // Check if user already has account settings and redirect if they do
  useEffect(() => {
    if (isLoaded && user && accountSettings !== undefined) {
      if (accountSettings) {
        // User already has account settings, redirect to /my
        router.replace('/my')
      }
    }
  }, [isLoaded, user, accountSettings, router])

  // Wait for Clerk to load and user to be authenticated
  if (!isLoaded || !user) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  // Show loading while checking account settings
  if (accountSettings === undefined) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  // If user already has settings, don't render anything (will redirect)
  if (accountSettings) {
    return null
  }

  const steps: WelcomeStep[] = [
    'welcome',
    'timezone',
    'reminders',
    'email',
    'confirmation',
  ]

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      // Validate email before proceeding to confirmation
      if (currentStep === 'email') {
        if (!welcomeData.notifications_email) {
          setEmailError('Please enter an email address')
          return
        }
        if (!validateEmail(welcomeData.notifications_email)) {
          setEmailError('Please enter a valid email address')
          return
        }
      }
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleSave = async () => {
    try {
      console.log('Starting save process...')
      console.log('Welcome data:', welcomeData)
      console.log('User:', user)
      console.log('User ID:', user?.id)
      console.log('Is user loaded:', isLoaded)
      console.log('Is Convex authenticated:', isAuthenticated)

      const hour24 = convertTo24Hour(
        welcomeData.weekly_reminder_hour,
        welcomeData.weekly_reminder_am_pm
      )

      const settingsData = {
        clerk_email: user?.primaryEmailAddress?.emailAddress || '',
        notifications_email:
          welcomeData.notifications_email ||
          user?.primaryEmailAddress?.emailAddress ||
          '',
        onboarding_completed: true,
        weekly_reminder: true,
        weekly_reminder_hour: hour24,
        weekly_reminder_minute: welcomeData.weekly_reminder_minute,
        weekly_reminder_day: welcomeData.weekly_reminder_day,
        weekly_reminder_time_zone: welcomeData.timezone,
      }

      console.log('Settings data to save:', settingsData)

      const result = await createSettings(settingsData)
      console.log('Save result:', result)

      router.push('/my')
    } catch (error) {
      console.error('Error saving settings:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  }

  const selectedTimezone = findTimezone(welcomeData.timezone)

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle email change with validation
  const handleEmailChange = (email: string) => {
    setWelcomeData(prev => ({ ...prev, notifications_email: email }))

    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  return (
    <div className='bg-background fixed inset-0 z-50 overflow-hidden'>
      {/* Fixed Sojournii Logo */}
      <div className='absolute top-16 left-8 z-10'>
        <Heading level='h1' weight='normal'>
          Sojournii
        </Heading>
      </div>

      <div className='flex h-screen items-center justify-center overflow-hidden p-4'>
        <div className='w-full max-w-4xl'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='w-full'
            >
              {currentStep === 'welcome' && (
                <div className='mx-auto w-full max-w-2xl text-center'>
                  <Heading level='h1' weight='bold' className='mb-6'>
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
                    We&apos;ll help you configure your timezone and notification
                    preferences to make the most of your experience.
                  </p>
                  <Button onClick={nextStep} size='lg' className='h-16 px-8'>
                    <Heading level='none' weight='normal' className='text-lg'>
                      Get Started
                    </Heading>
                  </Button>
                </div>
              )}

              {currentStep === 'timezone' && (
                <div className='mx-auto w-full max-w-2xl'>
                  <div className='mb-8 text-center'>
                    <Heading level='h2' weight='bold' className='mb-2'>
                      Your Timezone
                    </Heading>
                    <p className='text-muted-foreground'>
                      We&apos;ve detected your timezone to help with scheduling
                      and notifications.
                    </p>
                  </div>

                  <div className='space-y-6'>
                    {!showTimezoneSelector ? (
                      <div className='space-y-4'>
                        <div className='bg-muted rounded-lg p-6 text-center'>
                          <p className='text-muted-foreground mb-2'>
                            We detected your timezone as:
                          </p>
                          <Heading
                            level='h3'
                            weight='bold'
                            className='text-foreground'
                          >
                            {selectedTimezone?.city},{' '}
                            {selectedTimezone?.country}
                          </Heading>
                          <p className='text-muted-foreground text-sm'>
                            {selectedTimezone?.label}
                          </p>
                        </div>

                        <div className='text-center'>
                          <Button
                            variant='outline'
                            onClick={() => setShowTimezoneSelector(true)}
                            className='mb-4'
                          >
                            Select a different timezone
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        <div className='bg-muted rounded-lg p-4'>
                          <p className='text-muted-foreground mb-2 text-sm'>
                            {welcomeData.timezone === userTimezone
                              ? 'Currently using detected timezone:'
                              : 'You have selected:'}
                          </p>
                          <p className='text-foreground font-medium'>
                            {selectedTimezone?.city},{' '}
                            {selectedTimezone?.country}
                          </p>
                          <p className='text-muted-foreground text-sm'>
                            {selectedTimezone?.label}
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label>Search for a different timezone</Label>
                          <Command className='rounded-lg border shadow-md'>
                            <CommandInput placeholder='Search for your timezone...' />
                            <CommandList className='max-h-64'>
                              <CommandEmpty>No timezone found.</CommandEmpty>
                              <CommandGroup>
                                {timezones.map(tz => (
                                  <CommandItem
                                    key={tz.value}
                                    value={`${tz.city} ${tz.country} ${tz.label}`}
                                    onSelect={() => {
                                      setWelcomeData(prev => ({
                                        ...prev,
                                        timezone: tz.value,
                                      }))
                                    }}
                                    className='cursor-pointer'
                                  >
                                    <div className='flex w-full flex-col'>
                                      <div className='font-medium'>
                                        {tz.city}, {tz.country}
                                      </div>
                                      <div className='text-muted-foreground text-sm'>
                                        {tz.label}
                                      </div>
                                    </div>
                                    {welcomeData.timezone === tz.value && (
                                      <div className='text-primary ml-auto'>
                                        ✓
                                      </div>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>

                        <div className='text-center'>
                          <Button
                            variant='outline'
                            onClick={() => setShowTimezoneSelector(false)}
                          >
                            Use detected timezone
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className='flex justify-between'>
                      <Button variant='ghost' onClick={prevStep}>
                        Back
                      </Button>
                      <Button onClick={nextStep}>Next</Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'reminders' && (
                <div className='mx-auto w-full max-w-2xl'>
                  <div className='mb-8 text-center'>
                    <Heading level='h2' weight='bold' className='mb-2'>
                      Weekly Reminders
                    </Heading>
                    <p className='text-muted-foreground'>
                      Set up your preferred time for weekly reminders and
                      updates.
                    </p>
                  </div>

                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                      <div className='space-y-2'>
                        <Label>Day of Week</Label>
                        <Select
                          value={welcomeData.weekly_reminder_day}
                          onValueChange={value =>
                            setWelcomeData(prev => ({
                              ...prev,
                              weekly_reminder_day:
                                value as WelcomeData['weekly_reminder_day'],
                            }))
                          }
                        >
                          <SelectTrigger className='h-12 text-base'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map(day => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label>Time</Label>
                        <div className='grid grid-cols-3 gap-2'>
                          <Select
                            value={welcomeData.weekly_reminder_hour.toString()}
                            onValueChange={value =>
                              setWelcomeData(prev => ({
                                ...prev,
                                weekly_reminder_hour: parseInt(value),
                              }))
                            }
                          >
                            <SelectTrigger className='h-12 text-base'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {hours12.map(hour => (
                                <SelectItem
                                  key={hour.value}
                                  value={hour.value.toString()}
                                >
                                  {hour.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={welcomeData.weekly_reminder_minute.toString()}
                            onValueChange={value =>
                              setWelcomeData(prev => ({
                                ...prev,
                                weekly_reminder_minute: parseInt(value),
                              }))
                            }
                          >
                            <SelectTrigger className='h-12 text-base'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {minutes.map(minute => (
                                <SelectItem
                                  key={minute.value}
                                  value={minute.value.toString()}
                                >
                                  {minute.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={welcomeData.weekly_reminder_am_pm}
                            onValueChange={value =>
                              setWelcomeData(prev => ({
                                ...prev,
                                weekly_reminder_am_pm: value as 'AM' | 'PM',
                              }))
                            }
                          >
                            <SelectTrigger className='h-12 text-base'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {amPmOptions.map(option => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className='bg-muted rounded-lg p-4'>
                      <p className='text-muted-foreground text-sm'>
                        You&apos;ll receive weekly reminders every{' '}
                        <span className='font-medium'>
                          {
                            daysOfWeek.find(
                              d => d.value === welcomeData.weekly_reminder_day
                            )?.label
                          }
                        </span>{' '}
                        at{' '}
                        <span className='font-medium'>
                          {welcomeData.weekly_reminder_hour}:
                          {welcomeData.weekly_reminder_minute
                            .toString()
                            .padStart(2, '0')}{' '}
                          {welcomeData.weekly_reminder_am_pm}
                        </span>{' '}
                        in your timezone ({selectedTimezone?.city},{' '}
                        {selectedTimezone?.country}).
                      </p>
                    </div>

                    <div className='flex justify-between'>
                      <Button variant='ghost' onClick={prevStep}>
                        Back
                      </Button>
                      <Button onClick={nextStep}>Next</Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'email' && (
                <div className='mx-auto w-full max-w-2xl'>
                  <div className='mb-8 text-center'>
                    <Heading level='h2' weight='bold' className='mb-2'>
                      Notification Email
                    </Heading>
                    <p className='text-muted-foreground'>
                      Choose which email address to use for your weekly
                      reminders.
                    </p>
                  </div>

                  <div className='space-y-6'>
                    <div className='space-y-4'>
                      <p className='text-muted-foreground text-sm'>
                        We can send your weekly reminders to a different email
                        address than your account email, such as your work
                        email. You can change this address at any time in your
                        settings.
                      </p>

                      <div className='space-y-2'>
                        <Label htmlFor='notification-email'>
                          Weekly Notification Email
                        </Label>
                        <input
                          id='notification-email'
                          type='email'
                          value={welcomeData.notifications_email}
                          onChange={e => handleEmailChange(e.target.value)}
                          placeholder={
                            user?.primaryEmailAddress?.emailAddress ||
                            'Enter email address'
                          }
                          className={`ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-4 py-3 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                            emailError
                              ? 'border-red-500 focus-visible:ring-red-500'
                              : 'border-input bg-background'
                          }`}
                        />
                        {emailError && (
                          <p className='text-sm text-red-500'>{emailError}</p>
                        )}
                      </div>

                      <div className='text-center'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            handleEmailChange(
                              user?.primaryEmailAddress?.emailAddress || ''
                            )
                          }}
                          className='text-sm'
                        >
                          Use Account Email
                        </Button>
                      </div>
                    </div>

                    <div className='flex justify-between'>
                      <Button variant='ghost' onClick={prevStep}>
                        Back
                      </Button>
                      <Button onClick={nextStep}>Next</Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'confirmation' && (
                <div className='mx-auto w-full max-w-2xl'>
                  <div className='mb-8 text-center'>
                    <Heading level='h2' weight='bold' className='mb-2'>
                      Confirm Your Settings
                    </Heading>
                    <p className='text-muted-foreground'>
                      Review your preferences before we save them.
                    </p>
                  </div>

                  <div className='space-y-6'>
                    <div className='space-y-4'>
                      <div className='bg-muted rounded-lg p-4'>
                        <Heading level='h4' weight='normal' className='mb-2'>
                          Timezone
                        </Heading>
                        <p className='text-muted-foreground text-sm'>
                          <strong>Timezone:</strong> {selectedTimezone?.label}
                        </p>
                      </div>

                      <div className='bg-muted rounded-lg p-4'>
                        <Heading level='h4' weight='normal' className='mb-2'>
                          Weekly Reminders
                        </Heading>
                        <p className='text-muted-foreground text-sm'>
                          <strong>Schedule:</strong> Every{' '}
                          {
                            daysOfWeek.find(
                              d => d.value === welcomeData.weekly_reminder_day
                            )?.label
                          }{' '}
                          at {welcomeData.weekly_reminder_hour}:
                          {welcomeData.weekly_reminder_minute
                            .toString()
                            .padStart(2, '0')}{' '}
                          {welcomeData.weekly_reminder_am_pm}
                        </p>
                      </div>

                      <div className='bg-muted rounded-lg p-4'>
                        <Heading level='h4' weight='normal' className='mb-2'>
                          Weekly Notifications Email
                        </Heading>
                        <p className='text-muted-foreground text-sm'>
                          <strong>Email:</strong>{' '}
                          {welcomeData.notifications_email ||
                            user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>

                    <div className='flex justify-between'>
                      <Button variant='ghost' onClick={prevStep}>
                        Back
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={false}
                        size='lg'
                        className='h-16 px-8'
                      >
                        <Heading
                          level='none'
                          weight='normal'
                          className='text-lg'
                        >
                          {false ? 'Saving...' : 'Ready to Start'}
                        </Heading>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
