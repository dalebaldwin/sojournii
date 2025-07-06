'use client'

import { Heading } from '@/components/ui/heading'
import { ProgressBar } from '@/components/ui/progress-bar'
import {
  useAccountSettings,
  useCreateAccountSettings,
} from '@/hooks/useAccountSettings'
import { convertTo12Hour, convertTo24Hour } from '@/lib/time-functions'
import { findTimezone, getUserTimezone } from '@/lib/timezones'
import { ClerkUser } from '@/lib/types'
import {
  defaultPerformanceQuestions,
  WelcomeData,
  WelcomeStep,
} from '@/lib/welcome-data'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConfirmationSection } from './sections/ConfirmationSection'
import { EmailSection } from './sections/EmailSection'
import { EmployerSection } from './sections/EmployerSection'
import { PerformanceQuestionsSection } from './sections/PerformanceQuestionsSection'
import { ReadySection } from './sections/ReadySection'
import { RemindersSection } from './sections/RemindersSection'
import { TimezoneSection } from './sections/TimezoneSection'
import { WelcomeSection } from './sections/WelcomeSection'
import { WorkHoursSection } from './sections/WorkHoursSection'

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
    performanceQuestions: defaultPerformanceQuestions,
    work_hours: 38,
    work_minutes: 0,
    default_work_from_home: false,
    break_hours: 0,
    break_minutes: 30,
    employers: [
      {
        employer_name: '',
        start_year: undefined,
        start_month: undefined,
        start_day: undefined,
      },
    ],
  })

  // Check if user already has account settings and redirect if they do
  useEffect(() => {
    if (isLoaded && user && accountSettings !== undefined) {
      if (accountSettings?.onboarding_completed && currentStep !== 'ready') {
        // User already has completed onboarding, redirect to /my
        // But don't redirect if we're on the ready step
        router.replace('/my')
      }
    }
  }, [isLoaded, user, accountSettings, router, currentStep])

  // Validate email when entering the email step
  useEffect(() => {
    if (currentStep === 'email') {
      const emailToValidate =
        welcomeData.notifications_email ||
        user?.primaryEmailAddress?.emailAddress ||
        ''
      if (emailToValidate && !validateEmail(emailToValidate)) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    }
  }, [
    currentStep,
    welcomeData.notifications_email,
    user?.primaryEmailAddress?.emailAddress,
  ])

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

  // If user already has completed onboarding, don't render anything (will redirect)
  // But allow the ready step to render
  if (accountSettings?.onboarding_completed && currentStep !== 'ready') {
    return null
  }

  const steps: WelcomeStep[] = [
    'welcome',
    'timezone',
    'reminders',
    'email',
    'workHours',
    'employer',
    'performanceQuestions',
    'confirmation',
    'ready',
  ]

  // Calculate current step index for progress bar
  const currentStepIndex = steps.indexOf(currentStep)
  const totalSteps = steps.length - 1

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      // Validate email before proceeding to confirmation
      if (currentStep === 'email') {
        const emailToValidate =
          welcomeData.notifications_email ||
          user?.primaryEmailAddress?.emailAddress ||
          ''
        if (!emailToValidate) {
          setEmailError('Please enter an email address')
          return
        }
        if (!validateEmail(emailToValidate)) {
          setEmailError('Please enter a valid email address')
          return
        }
        // Clear any error if validation passes
        setEmailError('')
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

      // Filter and format employers to ensure required fields are present
      const validEmployers = welcomeData.employers
        ?.filter(
          emp =>
            emp.employer_name.trim() &&
            emp.start_year &&
            emp.start_month &&
            emp.start_day
        )
        .map(emp => ({
          employer_name: emp.employer_name,
          start_year: emp.start_year!,
          start_month: emp.start_month!,
          start_day: emp.start_day!,
          end_year: emp.end_year,
          end_month: emp.end_month,
          end_day: emp.end_day,
        }))

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
        perf_questions: welcomeData.performanceQuestions,
        work_hours: welcomeData.work_hours,
        work_minutes: welcomeData.work_minutes,
        default_work_from_home: welcomeData.default_work_from_home,
        break_hours: welcomeData.break_hours,
        break_minutes: welcomeData.break_minutes,
        employers: validEmployers,
      }

      console.log('Settings data to save:', settingsData)

      const result = await createSettings(settingsData)
      console.log('Save result:', result)

      // Go to ready step instead of directly to /my
      setCurrentStep('ready')
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

  const handleGetStarted = () => {
    router.push('/my')
  }

  const goToStep = (step: string) => {
    setCurrentStep(step as WelcomeStep)
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

    // If email is empty, it will use the account email, so clear any error
    if (!email) {
      setEmailError('')
      return
    }

    // Only validate if user has entered a custom email
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  return (
    <div className='bg-background fixed inset-0 z-50 overflow-hidden'>
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStepIndex} totalSteps={totalSteps} />

      {/* Fixed Sojournii Logo */}
      <div className='absolute top-20 left-8 z-10'>
        <Heading level='h1' weight='normal' showLines>
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

              {currentStep === 'workHours' && (
                <WorkHoursSection
                  welcomeData={welcomeData}
                  setWelcomeData={setWelcomeData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'employer' && (
                <EmployerSection
                  welcomeData={welcomeData}
                  setWelcomeData={setWelcomeData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'performanceQuestions' && (
                <PerformanceQuestionsSection
                  questions={welcomeData.performanceQuestions}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'confirmation' && (
                <ConfirmationSection
                  welcomeData={welcomeData}
                  selectedTimezone={selectedTimezone}
                  prevStep={prevStep}
                  handleSave={handleSave}
                  saving={saving}
                  goToStep={goToStep}
                />
              )}

              {currentStep === 'ready' && (
                <ReadySection onGetStarted={handleGetStarted} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
