'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Slider } from '@/components/ui/slider'
import {
  useCreateRetro,
  useRetroByWeek,
  useUpdateRetro,
} from '@/hooks/useRetros'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface RetroSliderSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  sliderKey:
    | 'general_feelings'
    | 'work_relationships'
    | 'professional_growth'
    | 'productivity'
    | 'personal_wellbeing'
  title: string
  context: string
  nextStep: () => void
  prevStep: () => void
}

export function RetroSliderSection({
  selectedWeek,
  sliderKey,
  title,
  context,
  nextStep,
  prevStep,
}: RetroSliderSectionProps) {
  const [sliderValue, setSliderValue] = useState(50)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Get existing retro for this week
  const existingRetro = useRetroByWeek(selectedWeek.startDate)
  const createRetro = useCreateRetro()
  const updateRetro = useUpdateRetro()

  // Initialize value from existing retro if available
  useEffect(() => {
    if (existingRetro && existingRetro[sliderKey] !== undefined) {
      setSliderValue(existingRetro[sliderKey])
    }
  }, [existingRetro, sliderKey])

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0])
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (existingRetro) {
        // Update existing retro
        await updateRetro({
          id: existingRetro._id,
          [sliderKey]: sliderValue,
        })
      } else {
        // Create new retro with default values
        const defaultRetroData = {
          week_start_date: selectedWeek.startDate,
          general_feelings: 50,
          work_relationships: 50,
          professional_growth: 50,
          productivity: 50,
          personal_wellbeing: 50,
          positive_outcomes: '',
          negative_outcomes: '',
          key_takeaways: '',
          [sliderKey]: sliderValue, // Override the specific key
        }
        await createRetro(defaultRetroData)
      }
      setHasChanges(false)
      toast.success('Rating saved successfully!')
    } catch (error) {
      console.error('Failed to save rating:', error)
      toast.error('Failed to save rating. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Save is handled on navigation only

  const handleNext = () => {
    if (hasChanges) {
      // Save before moving to next step
      handleSave().then(() => {
        nextStep()
      })
    } else {
      nextStep()
    }
  }

  const handlePrev = () => {
    if (hasChanges) {
      // Save before moving to previous step
      handleSave().then(() => {
        prevStep()
      })
    } else {
      prevStep()
    }
  }

  return (
    <div className='mx-auto max-w-2xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-3xl font-bold'>
          {title}
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>{context}</p>
        <div className='mb-6 text-xl font-semibold'>
          {selectedWeek.weekRange}
        </div>
      </div>

      <div className='space-y-8'>
        <div className='space-y-6'>
          <div className='text-center'>
            <span className='text-4xl font-bold'>{sliderValue}/100</span>
          </div>

          <Slider
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            max={100}
            min={0}
            step={1}
            className='w-full'
          />

          <div className='text-muted-foreground flex justify-between'>
            <span>Terrible</span>
            <span>Amazing</span>
          </div>
        </div>

        {hasChanges && (
          <div className='text-center'>
            <div className='text-sm text-orange-600 dark:text-orange-400'>
              Changes will be saved when you continue...
            </div>
          </div>
        )}
      </div>

      <div className='flex justify-between pt-8'>
        <Button variant='outline' onClick={handlePrev} size='lg'>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={saving} size='lg'>
          {saving ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
