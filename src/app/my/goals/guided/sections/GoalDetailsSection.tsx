'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { GoalData } from '@/lib/types'
import type { JSONContent } from '@tiptap/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface GoalDetailsSectionProps {
  goalData: GoalData
  setGoalData: (data: GoalData) => void
  nextStep: () => void
  prevStep: () => void
}

export function GoalDetailsSection({
  goalData,
  setGoalData,
  nextStep,
  prevStep,
}: GoalDetailsSectionProps) {
  const [showValidation, setShowValidation] = useState(false)

  const handleNameChange = (value: string) => {
    setGoalData({
      ...goalData,
      name: value,
    })
  }

  const handleDescriptionChange = (content: {
    html: string
    json: JSONContent
  }) => {
    setGoalData({
      ...goalData,
      description: content.html || '', // Fallback to HTML for legacy compatibility
      description_html: content.html,
      description_json: JSON.stringify(content.json),
    })
  }

  const isValid =
    goalData.name.trim().length > 0 &&
    (goalData.description.trim().length > 0 ||
      Boolean(goalData.description_html))

  const handleNext = () => {
    setShowValidation(true)
    if (!isValid) return
    nextStep()
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Goal Details
        </Heading>
        <p className='text-muted-foreground'>
          Give your goal a clear name and describe what you want to achieve.
        </p>
      </div>

      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='goal-name' className='text-sm font-medium'>
            Goal Name *
          </Label>
          <Input
            id='goal-name'
            type='text'
            placeholder='e.g., Launch my side business'
            value={goalData.name}
            onChange={e => handleNameChange(e.target.value)}
            className={`h-12 ${
              showValidation && !goalData.name.trim() ? 'border-red-500' : ''
            }`}
          />
          {showValidation && !goalData.name.trim() && (
            <p className='text-sm text-red-500'>Goal name is required</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='goal-description' className='text-sm font-medium'>
            Description *
          </Label>
          <TiptapEditor
            content={
              goalData.description_json
                ? JSON.parse(goalData.description_json)
                : goalData.description
            }
            onUpdate={handleDescriptionChange}
            placeholder='Describe what you want to achieve, why it matters to you, and what success looks like...'
            minHeight='120px'
            className={
              showValidation && !goalData.description.trim()
                ? 'border-red-500'
                : ''
            }
          />
          {showValidation && !goalData.description.trim() && (
            <p className='text-sm text-red-500'>Description is required</p>
          )}
          <p className='text-muted-foreground text-sm'>
            Be specific about what you want to accomplish and why it&apos;s
            important to you.
          </p>
        </div>

        <div className='bg-muted/50 rounded-lg p-4'>
          <h4 className='mb-2 text-sm font-semibold'>
            💡 Tips for a great goal:
          </h4>
          <ul className='text-muted-foreground space-y-1 text-sm'>
            <li>• Be specific and measurable</li>
            <li>• Include why this goal matters to you</li>
            <li>• Describe what success will look like</li>
            <li>• Make it challenging but achievable</li>
          </ul>
        </div>
      </div>

      <div className='mt-8 flex justify-between gap-4'>
        <Button
          variant='outline'
          onClick={prevStep}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Button
          onClick={handleNext}
          className='flex items-center gap-2'
          disabled={showValidation && !isValid}
        >
          Continue
          <ArrowRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
