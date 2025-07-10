'use client'

import { Heading } from '@/components/ui/heading'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useAccountSettings, useUserTimezone } from '@/hooks/useAccountSettings'
import {
  formatDateForDB,
  formatWeekRange,
  getCurrentWeek,
} from '@/lib/time-functions'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { GoalMilestoneSection } from './sections/GoalMilestoneSection'
import { GoalProgressSection } from './sections/GoalProgressSection'
import { PerformanceQuestionSection } from './sections/PerformanceQuestionSection'
import { PerformanceSection } from './sections/PerformanceSection'
import { RetroReflectionSection } from './sections/RetroReflectionSection'
import { RetroSliderSection } from './sections/RetroSliderSection'
import { TaskCompletionSection } from './sections/TaskCompletionSection'
import { WeekSelectionSection } from './sections/WeekSelectionSection'
import { WorkHoursSection } from './sections/WorkHoursSection'

export type SojournStep =
  | 'week-selection'
  | 'retro-general-feelings'
  | 'retro-work-relationships'
  | 'retro-professional-growth'
  | 'retro-productivity'
  | 'retro-personal-wellbeing'
  | 'retro-positive-outcomes'
  | 'retro-negative-outcomes'
  | 'retro-key-takeaways'
  | 'work-hours'
  | 'performance'
  | `performance-question-${string}`
  | 'goal-progress'
  | `goal-milestone-${string}`
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
  const userTimezone = useUserTimezone()

  const [currentStep, setCurrentStep] = useState<SojournStep>('week-selection')
  const [dynamicSteps, setDynamicSteps] = useState<SojournStep[]>([])
  const [sojournData, setSojournData] = useState<SojournData>(() => {
    const currentWeek = getCurrentWeek(undefined, userTimezone)
    return {
      selectedWeek: {
        startDate: formatDateForDB(currentWeek.startDate),
        endDate: formatDateForDB(currentWeek.endDate),
        weekRange: formatWeekRange(currentWeek.startDate, currentWeek.endDate),
      },
    }
  })

  // Get performance questions to generate dynamic steps
  const performanceQuestions = useQuery(
    api.performanceQuestions.listQuestions,
    {
      includeInactive: false,
    }
  )

  // Get goals and milestones for dynamic goal steps
  const goals = useQuery(api.goals.getGoals)
  const milestones = useQuery(api.milestones.getUserMilestones)

  // Generate dynamic steps when data is loaded
  useEffect(() => {
    if (performanceQuestions && goals && milestones) {
      const baseSteps: SojournStep[] = [
        'week-selection',
        'retro-general-feelings',
        'retro-work-relationships',
        'retro-professional-growth',
        'retro-productivity',
        'retro-personal-wellbeing',
        'retro-positive-outcomes',
        'retro-negative-outcomes',
        'retro-key-takeaways',
        'work-hours',
      ]

      // Add dynamic performance question steps
      const performanceSteps: SojournStep[] =
        performanceQuestions.length > 0
          ? performanceQuestions.map(
              q => `performance-question-${q._id}` as SojournStep
            )
          : ['performance'] // Fallback to original performance section if no questions

      // Add dynamic goal milestone steps
      const activeGoals = goals.filter(goal => goal.status === 'active')
      const goalMilestoneSteps: SojournStep[] = []

      activeGoals.forEach(goal => {
        const goalMilestones = milestones
          .filter(m => m.goal_id === goal._id)
          .sort((a, b) => a.order - b.order)

        goalMilestones.forEach(milestone => {
          goalMilestoneSteps.push(
            `goal-milestone-${milestone._id}` as SojournStep
          )
        })
      })

      const finalSteps: SojournStep[] =
        goalMilestoneSteps.length > 0 ? goalMilestoneSteps : ['goal-progress'] // Fallback to original goal progress section

      finalSteps.push('task-completion')

      const allSteps = [...baseSteps, ...performanceSteps, ...finalSteps]
      setDynamicSteps(allSteps)
    }
  }, [performanceQuestions, goals, milestones])

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

  // Wait for dynamic steps to be generated
  if (dynamicSteps.length === 0) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  const steps = dynamicSteps
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

  // Get current section name based on step
  const getSectionName = (step: SojournStep): string => {
    if (step === 'week-selection') return 'Sojourn'
    if (step.startsWith('retro-')) return 'Retro'
    if (step === 'work-hours') return 'Work Hours'
    if (step === 'performance' || step.startsWith('performance-question-'))
      return 'Performance'
    if (step === 'goal-progress' || step.startsWith('goal-milestone-'))
      return 'Goals'
    if (step === 'task-completion') return 'Tasks'
    return ''
  }

  // Skip to next section functionality
  const getSkipToSection = (
    currentSection: string
  ): { nextSection: string; nextStep: SojournStep } | null => {
    switch (currentSection) {
      case 'Sojourn':
        return { nextSection: 'Work Hours', nextStep: 'work-hours' }
      case 'Retro':
        return { nextSection: 'Work Hours', nextStep: 'work-hours' }
      case 'Work Hours':
        return {
          nextSection: 'Performance',
          nextStep:
            performanceQuestions && performanceQuestions.length > 0
              ? (`performance-question-${performanceQuestions[0]._id}` as SojournStep)
              : 'performance',
        }
      case 'Performance':
        // Skip to goals section - either first milestone or goal-progress fallback
        const firstGoalMilestoneStep = steps.find(step =>
          step.startsWith('goal-milestone-')
        )
        return {
          nextSection: 'Goals',
          nextStep: firstGoalMilestoneStep || 'goal-progress',
        }
      case 'Goals':
        return { nextSection: 'Tasks', nextStep: 'task-completion' }
      default:
        return null // Tasks section - no skip available
    }
  }

  const skipToSection = () => {
    const currentSection = getSectionName(currentStep)
    const skipInfo = getSkipToSection(currentSection)
    if (skipInfo) {
      setCurrentStep(skipInfo.nextStep)
    }
  }

  // Helper function to get performance question info
  const getPerformanceQuestionInfo = (step: SojournStep) => {
    if (!step.startsWith('performance-question-')) return null

    const questionId = step.replace('performance-question-', '')
    const question = performanceQuestions?.find(
      (q: { _id: string }) => q._id === questionId
    )
    if (!question) return null

    const questionIndex =
      performanceQuestions?.findIndex(
        (q: { _id: string }) => q._id === questionId
      ) ?? 0
    const totalQuestions = performanceQuestions?.length ?? 0

    return {
      question,
      questionIndex: questionIndex + 1,
      totalQuestions,
    }
  }

  // Helper function to get goal milestone info
  const getGoalMilestoneInfo = (step: SojournStep) => {
    if (!step.startsWith('goal-milestone-')) return null

    const milestoneId = step.replace('goal-milestone-', '')
    const milestone = milestones?.find(
      (m: { _id: string }) => m._id === milestoneId
    )
    if (!milestone) return null

    const goal = goals?.find(
      (g: { _id: string; goal_id?: string }) =>
        g._id === (milestone as { goal_id: string }).goal_id
    )
    if (!goal) return null

    // Calculate milestone index within all active goal milestones
    const activeGoals =
      goals?.filter((g: { status: string }) => g.status === 'active') || []
    let milestoneIndex = 1
    let totalMilestones = 0

    for (const activeGoal of activeGoals) {
      const goalMilestones =
        milestones
          ?.filter(
            (m: { goal_id: string }) =>
              m.goal_id === (activeGoal as { _id: string })._id
          )
          .sort(
            (a: { order: number }, b: { order: number }) => a.order - b.order
          ) || []

      totalMilestones += goalMilestones.length

      const foundIndex = goalMilestones.findIndex(
        (m: { _id: string }) => m._id === milestoneId
      )
      if (foundIndex !== -1) {
        break
      } else {
        milestoneIndex += goalMilestones.length
      }
    }

    return {
      milestone,
      goal,
      milestoneIndex,
      totalMilestones,
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Progress Bar with Section Name */}
      <div className='bg-white dark:bg-gray-900'>
        <div className='container mx-auto px-4 py-3'>
          <div className='mb-4 pt-4'>
            <Heading
              level='h1'
              weight='normal'
              showLines={true}
              className='text-5xl text-gray-800 dark:text-gray-200'
            >
              {getSectionName(currentStep)}
            </Heading>
            {/* Skip Section Link */}
            {(() => {
              const currentSection = getSectionName(currentStep)
              const skipInfo = getSkipToSection(currentSection)
              // Don't show skip link on the first page (week-selection)
              return skipInfo && currentStep !== 'week-selection' ? (
                <button
                  onClick={skipToSection}
                  className='mt-2 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                >
                  <span>Skip to {skipInfo.nextSection}</span>
                  <ChevronRight className='h-4 w-4' />
                </button>
              ) : null
            })()}
          </div>
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

              {currentStep === 'retro-general-feelings' && (
                <RetroSliderSection
                  selectedWeek={sojournData.selectedWeek}
                  sliderKey='general_feelings'
                  title='General feelings about work?'
                  context='How has your work week been overall? Did things run smoothly or were there any bumps in the road?'
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-work-relationships' && (
                <RetroSliderSection
                  selectedWeek={sojournData.selectedWeek}
                  sliderKey='work_relationships'
                  title='How do you feel about your work relationships?'
                  context='Are you working well with your team? Are you feeling supported and valued? Had a great watercooler moment?'
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-professional-growth' && (
                <RetroSliderSection
                  selectedWeek={sojournData.selectedWeek}
                  sliderKey='professional_growth'
                  title='How are you feeling about your professional growth?'
                  context='Are you getting a promotion or are you feeling like you are treading water or going backwards?'
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-productivity' && (
                <RetroSliderSection
                  selectedWeek={sojournData.selectedWeek}
                  sliderKey='productivity'
                  title='How are you feeling about your productivity?'
                  context='Did you smash it out of the park and get everything done or are you feeling like you are drowning in work and getting nothing done?'
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-personal-wellbeing' && (
                <RetroSliderSection
                  selectedWeek={sojournData.selectedWeek}
                  sliderKey='personal_wellbeing'
                  title='How are you feeling about your personal life and wellbeing?'
                  context='How has your personal life and wellbeing been? Are you feeling great or overcome with feelings of existential dread?'
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-positive-outcomes' && (
                <RetroReflectionSection
                  selectedWeek={sojournData.selectedWeek}
                  reflectionKey='positive_outcomes'
                  title='What were your positive outcomes for the week?'
                  context='What were your highlights and what went well? What made you happy about this week?'
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-negative-outcomes' && (
                <RetroReflectionSection
                  selectedWeek={sojournData.selectedWeek}
                  reflectionKey='negative_outcomes'
                  title='What were your negative outcomes, challenges and frustrations?'
                  context='What made you want to snooze your alarm in the morning? Did you come up against something impossible to do or just wanted to embed your laptop in the dry wall?'
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 'retro-key-takeaways' && (
                <RetroReflectionSection
                  selectedWeek={sojournData.selectedWeek}
                  reflectionKey='key_takeaways'
                  title='What are your key takeaways from this week?'
                  context='What is something you learned this week? What is something you want to do better? What do you want to change?'
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

              {currentStep.startsWith('performance-question-') &&
                (() => {
                  const questionInfo = getPerformanceQuestionInfo(currentStep)
                  return questionInfo ? (
                    <PerformanceQuestionSection
                      selectedWeek={sojournData.selectedWeek}
                      questionId={questionInfo.question._id}
                      questionTitle={questionInfo.question.title}
                      questionDescription={questionInfo.question.description}
                      questionDescriptionJson={
                        questionInfo.question.description_json
                      }
                      questionIndex={questionInfo.questionIndex}
                      totalQuestions={questionInfo.totalQuestions}
                      nextStep={nextStep}
                      prevStep={prevStep}
                    />
                  ) : null
                })()}

              {currentStep === 'goal-progress' && (
                <GoalProgressSection
                  selectedWeek={sojournData.selectedWeek}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep.startsWith('goal-milestone-') &&
                (() => {
                  const milestoneInfo = getGoalMilestoneInfo(currentStep)
                  return milestoneInfo ? (
                    <GoalMilestoneSection
                      selectedWeek={sojournData.selectedWeek}
                      milestone={milestoneInfo.milestone}
                      goal={milestoneInfo.goal}
                      milestoneIndex={milestoneInfo.milestoneIndex}
                      totalMilestones={milestoneInfo.totalMilestones}
                      nextStep={nextStep}
                      prevStep={prevStep}
                    />
                  ) : null
                })()}

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
