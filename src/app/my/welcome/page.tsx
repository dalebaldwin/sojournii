'use client'

import { Heading } from '@/components/ui/heading'
import {
  useAccountSettings,
  useCreateAccountSettings,
} from '@/hooks/useAccountSettings'
import { convertTo12Hour, convertTo24Hour } from '@/lib/time-functions'
import { findTimezone, getUserTimezone } from '@/lib/timezones'
import { ClerkUser } from '@/lib/types'
import { WelcomeData, WelcomeStep } from '@/lib/welcome-data'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConfirmationSection } from './sections/ConfirmationSection'
import { EmailSection } from './sections/EmailSection'
import { RemindersSection } from './sections/RemindersSection'
import { TimezoneSection } from './sections/TimezoneSection'
import { WelcomeSection } from './sections/WelcomeSection'

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
  const [saving, setSaving] = useState(false)
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
      setSaving(true)
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
    } finally {
      setSaving(false)
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
                <WelcomeSection user={user as ClerkUser} nextStep={nextStep} />
              )}

              {currentStep === 'timezone' && (
                <TimezoneSection
                  welcomeData={welcomeData}
                  userTimezone={userTimezone}
                  showTimezoneSelector={showTimezoneSelector}
                  setShowTimezoneSelector={setShowTimezoneSelector}
                  setWelcomeData={setWelcomeData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                  selectedTimezone={selectedTimezone}
                />
              )}

              {currentStep === 'reminders' && (
                <RemindersSection
                  welcomeData={welcomeData}
                  setWelcomeData={setWelcomeData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                  selectedTimezone={selectedTimezone}
                />
              )}

              {currentStep === 'email' && (
                <EmailSection
                  welcomeData={welcomeData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                  user={user as ClerkUser}
                  emailError={emailError}
                  handleEmailChange={handleEmailChange}
                />
              )}

              {currentStep === 'confirmation' && (
                <ConfirmationSection
                  welcomeData={welcomeData}
                  user={user as ClerkUser}
                  selectedTimezone={selectedTimezone}
                  prevStep={prevStep}
                  handleSave={handleSave}
                  saving={saving}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
