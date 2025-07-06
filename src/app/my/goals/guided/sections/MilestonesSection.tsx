'use client'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import { getTomorrowInTimezone, timestampToDate } from '@/lib/time-functions'
import { GoalData, MilestoneData } from '@/lib/types'
import type { JSONContent } from '@tiptap/react'
import { ArrowLeft, ArrowRight, Plus, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface MilestonesSectionProps {
  goalData: GoalData
  setGoalData: (data: GoalData) => void
  nextStep: () => void
  prevStep: () => void
}

export function MilestonesSection({
  goalData,
  setGoalData,
  nextStep,
  prevStep,
}: MilestonesSectionProps) {
  const [showValidation, setShowValidation] = useState(false)
  const userTimezone = useUserTimezone()

  const addMilestone = () => {
    const newMilestone: MilestoneData = {
      name: '',
      description: '',
      target_date: undefined,
    }
    setGoalData({
      ...goalData,
      milestones: [...goalData.milestones, newMilestone],
    })
  }

  const removeMilestone = (index: number) => {
    const updatedMilestones = goalData.milestones.filter((_, i) => i !== index)
    setGoalData({
      ...goalData,
      milestones: updatedMilestones,
    })
  }

  const updateMilestone = (
    index: number,
    field: keyof MilestoneData,
    value: string | Date | undefined
  ) => {
    const updatedMilestones = [...goalData.milestones]
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    }
    setGoalData({
      ...goalData,
      milestones: updatedMilestones,
    })
  }

  const updateMilestoneDescription = (
    index: number,
    content: { html: string; json: JSONContent }
  ) => {
    const updatedMilestones = [...goalData.milestones]
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      description: content.html || '', // Fallback to HTML for legacy compatibility
      description_html: content.html,
      description_json: JSON.stringify(content.json),
    }
    setGoalData({
      ...goalData,
      milestones: updatedMilestones,
    })
  }

  const isValidMilestone = (milestone: MilestoneData) => {
    return (
      milestone.name.trim().length > 0 &&
      (milestone.description.trim().length > 0 ||
        Boolean(milestone.description_html))
    )
  }

  const isValid =
    goalData.milestones.length > 0 &&
    goalData.milestones.every(isValidMilestone)

  const handleNext = () => {
    setShowValidation(true)
    if (!isValid) return
    nextStep()
  }

  const getMinDate = () => {
    // Use timezone-aware tomorrow calculation
    return getTomorrowInTimezone(userTimezone)
  }

  const getMaxDate = () => {
    // If goal has target date, convert timestamp back to Date for comparison
    return goalData.target_date
      ? timestampToDate(goalData.target_date.getTime())
      : undefined
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Goal Milestones
        </Heading>
        <p className='text-muted-foreground'>
          Break your goal into smaller, achievable milestones that will help you
          track progress.
        </p>
      </div>

      <div className='space-y-6'>
        {goalData.milestones.map((milestone, index) => (
          <div
            key={index}
            className='border-border bg-background rounded-lg border p-6'
          >
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Target className='text-primary h-5 w-5' />
                <span className='font-medium'>
                  Milestone {index + 1}
                  {goalData.milestones.length > 1 && (
                    <span className='text-muted-foreground'>
                      {' '}
                      of {goalData.milestones.length}
                    </span>
                  )}
                </span>
              </div>
              {goalData.milestones.length > 1 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeMilestone(index)}
                  className='text-red-600 hover:text-red-700'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              )}
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor={`milestone-name-${index}`}
                  className='text-sm font-medium'
                >
                  Milestone Name *
                </Label>
                <Input
                  id={`milestone-name-${index}`}
                  placeholder='e.g., Complete research phase'
                  value={milestone.name}
                  onChange={e => updateMilestone(index, 'name', e.target.value)}
                  className={
                    showValidation && !milestone.name.trim()
                      ? 'border-red-500'
                      : ''
                  }
                />
                {showValidation && !milestone.name.trim() && (
                  <p className='text-sm text-red-500'>
                    Milestone name is required
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor={`milestone-description-${index}`}
                  className='text-sm font-medium'
                >
                  Description *
                </Label>
                <TiptapEditor
                  content={
                    milestone.description_json
                      ? JSON.parse(milestone.description_json)
                      : milestone.description
                  }
                  onUpdate={content =>
                    updateMilestoneDescription(index, content)
                  }
                  placeholder='What needs to be accomplished for this milestone?'
                  minHeight='80px'
                  className={
                    showValidation && !milestone.description.trim()
                      ? 'border-red-500'
                      : ''
                  }
                />
                {showValidation && !milestone.description.trim() && (
                  <p className='text-sm text-red-500'>
                    Description is required
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor={`milestone-date-${index}`}
                  className='text-sm font-medium'
                >
                  Target Date (Optional)
                </Label>
                <DatePicker
                  date={milestone.target_date}
                  onDateChange={date =>
                    updateMilestone(index, 'target_date', date)
                  }
                  placeholder='Select milestone target date'
                  minDate={getMinDate()}
                  maxDate={getMaxDate()}
                  userTimezone={userTimezone}
                />
                {goalData.target_date && (
                  <p className='text-muted-foreground text-sm'>
                    Must be before your goal&apos;s target date
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button
          variant='outline'
          onClick={addMilestone}
          className='h-12 w-full border-dashed'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Another Milestone
        </Button>

        {showValidation && !isValid && (
          <div className='rounded-lg bg-red-50 p-4 dark:bg-red-950/30'>
            <p className='text-sm text-red-800 dark:text-red-200'>
              Please complete all required fields before proceeding. Each
              milestone needs a name and description.
            </p>
          </div>
        )}

        <div className='flex gap-4'>
          <Button
            variant='outline'
            onClick={prevStep}
            className='flex items-center gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className='flex flex-1 items-center justify-center gap-2'
          >
            Review Goal
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
