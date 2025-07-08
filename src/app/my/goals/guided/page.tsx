'use client'

import { ProgressBar } from '@/components/ui/progress-bar'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import { convertSelectedDateToTimestamp } from '@/lib/time-functions'
import { GoalData, GoalStep } from '@/lib/types'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import { ConfirmationSection } from './sections/ConfirmationSection'
import { GoalDateSection } from './sections/GoalDateSection'
import { GoalDetailsSection } from './sections/GoalDetailsSection'
import { IntroSection } from './sections/IntroSection'
import { MilestonesSection } from './sections/MilestonesSection'

export default function GuidedGoalsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const createGoalWithMilestones = useMutation(
    api.goals.createGoalWithMilestones
  )
  const userTimezone = useUserTimezone()

  const [currentStep, setCurrentStep] = useState<GoalStep>('intro')
  const [saving, setSaving] = useState(false)
  const [goalData, setGoalData] = useState<GoalData>({
    name: '',
    description: '',
    description_html: '',
    description_json: '',
    target_date: undefined,
    milestones: [],
  })

  // Wait for Clerk to load and user to be authenticated
  if (!isLoaded || !user) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  const steps: GoalStep[] = [
    'intro',
    'details',
    'date',
    'milestones',
    'confirmation',
  ]

  // Calculate current step index for progress bar
  const currentStepIndex = steps.indexOf(currentStep)
  const totalSteps = steps.length - 1

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
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

      // Convert milestones to the format expected by the mutation
      const milestonesForSaving = goalData.milestones.map(milestone => ({
        name: milestone.name,
        description: milestone.description,
        description_html: milestone.description_html,
        description_json: milestone.description_json,
        target_date: milestone.target_date
          ? convertSelectedDateToTimestamp(milestone.target_date, userTimezone)
          : undefined,
      }))

      // Create the goal with milestones
      await createGoalWithMilestones({
        name: goalData.name,
        description: goalData.description,
        description_html: goalData.description_html,
        description_json: goalData.description_json,
        target_date: goalData.target_date
          ? convertSelectedDateToTimestamp(goalData.target_date, userTimezone)
          : undefined,
        milestones: milestonesForSaving,
      })

      // Redirect to goals page
      router.push('/my/goals')
    } catch (error) {
      console.error('Error saving goal:', error)
      // TODO: Show error message to user
    } finally {
      setSaving(false)
    }
  }

  const goToStep = (step: GoalStep) => {
    setCurrentStep(step)
  }

  return (
    <div className='bg-background min-h-screen'>
      {/* Progress bar - only show after intro */}
      {currentStep !== 'intro' && (
        <ProgressBar
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          withSidebar={true}
        />
      )}

      <div className='flex min-h-screen flex-col items-center justify-center p-4'>
        <div className='w-full max-w-4xl'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 'intro' && <IntroSection nextStep={nextStep} />}

              {currentStep === 'details' && (
                <GoalDetailsSection
                  goalData={goalData}
                  setGoalData={setGoalData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'date' && (
                <GoalDateSection
                  goalData={goalData}
                  setGoalData={setGoalData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'milestones' && (
                <MilestonesSection
                  goalData={goalData}
                  setGoalData={setGoalData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'confirmation' && (
                <ConfirmationSection
                  goalData={goalData}
                  prevStep={prevStep}
                  handleSave={handleSave}
                  saving={saving}
                  goToStep={goToStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
