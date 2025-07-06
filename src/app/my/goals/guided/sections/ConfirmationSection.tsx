'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import { formatTimestampInTimezone } from '@/lib/time-functions'
import { GoalData, GoalStep } from '@/lib/types'
import { Calendar, Target } from 'lucide-react'

interface ConfirmationSectionProps {
  goalData: GoalData
  prevStep: () => void
  handleSave: () => void
  saving: boolean
  goToStep: (step: GoalStep) => void
}

export function ConfirmationSection({
  goalData,
  prevStep,
  handleSave,
  saving,
  goToStep,
}: ConfirmationSectionProps) {
  const userTimezone = useUserTimezone()

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Review Your Goal
        </Heading>
        <p className='text-muted-foreground'>
          Take a moment to review your goal and milestones before saving.
        </p>
      </div>

      <div className='space-y-6'>
        {/* Goal Details */}
        <div className='border-border bg-background rounded-lg border p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <Heading level='h3' weight='bold' className='text-lg'>
              Goal Details
            </Heading>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => goToStep('details')}
              className='text-sm'
            >
              Edit
            </Button>
          </div>

          <div className='space-y-3'>
            <div>
              <span className='text-sm font-medium'>Name:</span>
              <p className='text-foreground'>{goalData.name}</p>
            </div>
            <div>
              <span className='text-sm font-medium'>Description:</span>
              <p className='text-foreground'>{goalData.description}</p>
            </div>
          </div>
        </div>

        {/* Target Date */}
        <div className='border-border bg-background rounded-lg border p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <Heading level='h3' weight='bold' className='text-lg'>
              Target Date
            </Heading>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => goToStep('date')}
              className='text-sm'
            >
              Edit
            </Button>
          </div>

          <div className='flex items-center gap-3'>
            <Calendar className='text-muted-foreground h-5 w-5' />
            {goalData.target_date ? (
              <p>
                {formatTimestampInTimezone(
                  goalData.target_date.getTime(),
                  userTimezone,
                  'MMMM d, yyyy'
                )}
              </p>
            ) : (
              <p className='text-muted-foreground'>No target date set</p>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className='border-border bg-background rounded-lg border p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <Heading level='h3' weight='bold' className='text-lg'>
              Milestones ({goalData.milestones.length})
            </Heading>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => goToStep('milestones')}
              className='text-sm'
            >
              Edit
            </Button>
          </div>

          <div className='space-y-4'>
            {goalData.milestones.map((milestone, index) => (
              <div key={index} className='bg-muted/50 rounded-lg p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <Target className='text-primary h-4 w-4' />
                  <span className='font-medium'>{milestone.name}</span>
                </div>
                <p className='text-muted-foreground mb-2 text-sm'>
                  {milestone.description}
                </p>
                {milestone.target_date && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='h-3 w-3' />
                    <span>
                      Target:{' '}
                      {formatTimestampInTimezone(
                        milestone.target_date.getTime(),
                        userTimezone,
                        'MMM d, yyyy'
                      )}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className='border-border bg-background rounded-lg border p-6'>
          <Heading level='h3' weight='bold' className='mb-4 text-lg'>
            Summary
          </Heading>
          <div className='text-muted-foreground space-y-1 text-sm'>
            <p>• Goal: {goalData.name}</p>
            <p>• Milestones: {goalData.milestones.length}</p>
            {goalData.target_date && (
              <p>
                • Target Date:{' '}
                {formatTimestampInTimezone(
                  goalData.target_date.getTime(),
                  userTimezone,
                  'MMMM d, yyyy'
                )}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4'>
          <Button
            variant='outline'
            onClick={prevStep}
            disabled={saving}
            className='flex-1'
          >
            Previous
          </Button>
          <Button onClick={handleSave} disabled={saving} className='flex-1'>
            {saving ? 'Saving...' : 'Create Goal'}
          </Button>
        </div>
      </div>
    </div>
  )
}
