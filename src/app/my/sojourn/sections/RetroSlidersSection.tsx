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

interface RetroSlidersSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  nextStep: () => void
  prevStep: () => void
}

const sliderConfigs = [
  {
    key: 'general_feelings' as const,
    title: 'General feelings about work?',
    context:
      'How has your work week been overall? Did things run smoothly or were there any bumps in the road?',
  },
  {
    key: 'work_relationships' as const,
    title: 'How do you feel about your work relationships?',
    context:
      'Are you working well with your team? Are you feeling supported and valued? Had a great watercooler moment?',
  },
  {
    key: 'professional_growth' as const,
    title: 'How are you feeling about your professional growth?',
    context:
      'Are you getting a promotion or are you feeling like you are treading water or going backwards?',
  },
  {
    key: 'productivity' as const,
    title: 'How are you feeling about your productivity?',
    context:
      'Did you smash it out of the park and get everything done or are you feeling like you are drowning in work and getting nothing done?',
  },
  {
    key: 'personal_wellbeing' as const,
    title: 'How are you feeling about your personal life and wellbeing?',
    context:
      'How has your personal life and wellbeing been? Are you feeling great or overcome with feelings of existential dread?',
  },
]

export function RetroSlidersSection({
  selectedWeek,
  nextStep,
  prevStep,
}: RetroSlidersSectionProps) {
  const [sliderValues, setSliderValues] = useState({
    general_feelings: 50,
    work_relationships: 50,
    professional_growth: 50,
    productivity: 50,
    personal_wellbeing: 50,
  })
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Get existing retro for this week
  const existingRetro = useRetroByWeek(selectedWeek.startDate)
  const createRetro = useCreateRetro()
  const updateRetro = useUpdateRetro()

  // Initialize values from existing retro if available
  useEffect(() => {
    if (existingRetro) {
      setSliderValues({
        general_feelings: existingRetro.general_feelings,
        work_relationships: existingRetro.work_relationships,
        professional_growth: existingRetro.professional_growth,
        productivity: existingRetro.productivity,
        personal_wellbeing: existingRetro.personal_wellbeing,
      })
    }
  }, [existingRetro])

  const handleSliderChange = (
    key: keyof typeof sliderValues,
    value: number[]
  ) => {
    setSliderValues(prev => ({ ...prev, [key]: value[0] }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (existingRetro) {
        // Update existing retro
        await updateRetro({
          id: existingRetro._id,
          ...sliderValues,
        })
      } else {
        // Create new retro with default text values
        await createRetro({
          week_start_date: selectedWeek.startDate,
          ...sliderValues,
          positive_outcomes: '',
          negative_outcomes: '',
          key_takeaways: '',
        })
      }
      setHasChanges(false)
      toast.success('Retro ratings saved successfully!')
    } catch (error) {
      console.error('Failed to save retro:', error)
      toast.error('Failed to save retro ratings. Please try again.')
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
    <div className='mx-auto max-w-3xl space-y-12 py-8'>
      <div className='text-center'>
        <Heading level='h1' className='mb-4 text-3xl font-bold'>
          Weekly Reflection Ratings
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>
          How did this week feel? Rate your experience across these key areas.
        </p>
        <div className='mb-6 text-xl font-semibold'>
          {selectedWeek.weekRange}
        </div>
      </div>

      <div className='space-y-10'>
        {sliderConfigs.map(config => (
          <div key={config.key} className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='text-xl font-semibold'>{config.title}</h3>
              <p className='text-muted-foreground'>{config.context}</p>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Rating</span>
                <span className='text-2xl font-bold'>
                  {sliderValues[config.key]}/100
                </span>
              </div>

              <Slider
                value={[sliderValues[config.key]]}
                onValueChange={value => handleSliderChange(config.key, value)}
                max={100}
                min={0}
                step={1}
                className='w-full'
              />

              <div className='text-muted-foreground flex justify-between text-sm'>
                <span>Terrible</span>
                <span>Amazing</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className='text-center'>
          <div className='text-sm text-orange-600 dark:text-orange-400'>
            Changes will be saved when you continue...
          </div>
        </div>
      )}

      <div className='flex justify-between pt-8'>
        <Button variant='outline' onClick={handlePrev} size='lg'>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={saving} size='lg'>
          {saving ? 'Saving...' : 'Next: Reflections'}
        </Button>
      </div>
    </div>
  )
}
