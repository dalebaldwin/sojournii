'use client'

import { ProgressBar } from '@/components/ui/progress-bar'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import { formatWeekRange, getCurrentWeek } from '@/lib/time-functions'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GoalProgressSection } from './sections/GoalProgressSection'
import { PerformanceSection } from './sections/PerformanceSection'
import { RetroReflectionsSection } from './sections/RetroReflectionsSection'
import { RetroSlidersSection } from './sections/RetroSlidersSection'
import { TaskCompletionSection } from './sections/TaskCompletionSection'
import { WeekSelectionSection } from './sections/WeekSelectionSection'
import { WorkHoursSection } from './sections/WorkHoursSection'

export type SojournStep =
  | 'week-selection'
  | 'retro-sliders'
  | 'retro-reflections'
  | 'work-hours'
  | 'performance'
  | 'goal-progress'
  | 'task-completion'

export interface SojournData {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  // Data will be saved incrementally, so we don't need to store everything here
}

export default function SojournPage() {
  const { user, isLoaded } = useUser()
  const { isAuthenticated } = useConvexAuth()
  const router = useRouter()
  const accountSettings = useAccountSettings()

  const [currentStep, setCurrentStep] = useState<SojournStep>('week-selection')
  const [sojournData, setSojournData] = useState<SojournData>(() => {
    const currentWeek = getCurrentWeek()
    return {
      selectedWeek: {
        startDate: currentWeek.startDate.toISOString().split('T')[0],
        endDate: currentWeek.endDate.toISOString().split('T')[0],
        weekRange: formatWeekRange(currentWeek.startDate, currentWeek.endDate),
      },
    }
  })

  // Wait for Clerk to load and user to be authenticated
  if (!isLoaded || !user || !isAuthenticated) {
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

  // Redirect if user hasn't completed onboarding
  if (!accountSettings?.onboarding_completed) {
    router.replace('/my/welcome')
    return null
  }

  const steps: SojournStep[] = [
    'week-selection',
    'retro-sliders',
    'retro-reflections',
    'work-hours',
    'performance',
    'goal-progress',
    'task-completion',
  ]

  // Calculate current step index for progress bar
  const currentStepIndex = steps.indexOf(currentStep)
  const totalSteps = steps.length

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    } else {
      // Completed all steps, return to dashboard
      router.push('/my')
    }
  }

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Progress Bar Only */}
      <div className='sticky top-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80'>
        <div className='container mx-auto px-4 py-3'>
          <ProgressBar
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            className='h-2'
          />
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4'>
        <div className='mx-auto w-full max-w-4xl'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='w-full'
            >
              {currentStep === 'week-selection' && (
                <WeekSelectionSection
                  sojournData={sojournData}
                  setSojournData={setSojournData}
                  nextStep={nextStep}
                />
              )}

              {currentStep === 'retro-sliders' && (
                <RetroSlidersSection
                  selectedWeek={sojournData.selectedWeek}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-reflections' && (
                <RetroReflectionsSection
                  selectedWeek={sojournData.selectedWeek}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'work-hours' && (
                <WorkHoursSection
                  selectedWeek={sojournData.selectedWeek}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'performance' && (
                <PerformanceSection
                  selectedWeek={sojournData.selectedWeek}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'goal-progress' && (
                <GoalProgressSection
                  selectedWeek={sojournData.selectedWeek}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'task-completion' && (
                <TaskCompletionSection
                  selectedWeek={sojournData.selectedWeek}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
