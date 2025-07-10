'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import {
  useCreateRetro,
  useRetroByWeek,
  useUpdateRetro,
} from '@/hooks/useRetros'
import type { JSONContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface RetroReflectionsSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  nextStep: () => void
  prevStep: () => void
}

const textConfigs = [
  {
    key: 'positive_outcomes' as const,
    title: 'What were your positive outcomes for the week?',
    context:
      'What were your highlights and what went well? What made you happy about this week?',
  },
  {
    key: 'negative_outcomes' as const,
    title: 'What were your negative outcomes, challenges and frustrations?',
    context:
      'What made you want to snooze your alarm in the morning? Did you come up against something impossible to do or just wanted to embed your laptop in the dry wall?',
  },
  {
    key: 'key_takeaways' as const,
    title: 'What are your key takeaways from this week?',
    context:
      'What is something you learned this week? What is something you want to do better? What do you want to change?',
  },
]

export function RetroReflectionsSection({
  selectedWeek,
  nextStep,
  prevStep,
}: RetroReflectionsSectionProps) {
  const [textValues, setTextValues] = useState({
    positive_outcomes: '',
    positive_outcomes_html: '',
    positive_outcomes_json: '',
    negative_outcomes: '',
    negative_outcomes_html: '',
    negative_outcomes_json: '',
    key_takeaways: '',
    key_takeaways_html: '',
    key_takeaways_json: '',
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
      setTextValues({
        positive_outcomes: existingRetro.positive_outcomes,
        positive_outcomes_html: existingRetro.positive_outcomes_html || '',
        positive_outcomes_json: existingRetro.positive_outcomes_json || '',
        negative_outcomes: existingRetro.negative_outcomes,
        negative_outcomes_html: existingRetro.negative_outcomes_html || '',
        negative_outcomes_json: existingRetro.negative_outcomes_json || '',
        key_takeaways: existingRetro.key_takeaways,
        key_takeaways_html: existingRetro.key_takeaways_html || '',
        key_takeaways_json: existingRetro.key_takeaways_json || '',
      })
    }
  }, [existingRetro])

  const handleTextChange = (
    key: keyof typeof textValues,
    data: { html: string; json: JSONContent }
  ) => {
    // Extract plain text from HTML for storage
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = data.html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    const baseKey = key.replace('_html', '').replace('_json', '')

    setTextValues(prev => ({
      ...prev,
      [baseKey]: plainText,
      [`${baseKey}_html`]: data.html,
      [`${baseKey}_json`]: JSON.stringify(data.json),
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (existingRetro) {
        // Update existing retro
        await updateRetro({
          id: existingRetro._id,
          ...textValues,
        })
      } else {
        // Create new retro with default slider values
        await createRetro({
          week_start_date: selectedWeek.startDate,
          // Default slider values
          general_feelings: 50,
          work_relationships: 50,
          professional_growth: 50,
          productivity: 50,
          personal_wellbeing: 50,
          // Text values
          ...textValues,
        })
      }
      setHasChanges(false)
      toast.success('Retro reflections saved successfully!')
    } catch (error) {
      console.error('Failed to save retro reflections:', error)
      toast.error('Failed to save retro reflections. Please try again.')
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
        <Heading level='h1' className='mb-4 text-2xl font-bold'>
          Weekly Reflections
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>
          Now let&apos;s dive deeper into your week with some reflection
          questions.
        </p>
        <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
          <div className='text-lg font-semibold text-blue-700 dark:text-blue-300'>
            {selectedWeek.weekRange}
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        {textConfigs.map(config => (
          <div key={config.key} className='space-y-4 rounded-lg border p-6'>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold'>{config.title}</h3>
              <p className='text-muted-foreground text-sm'>{config.context}</p>
            </div>

            <TiptapEditor
              content={
                textValues[`${config.key}_json`] || textValues[config.key] || ''
              }
              onUpdate={data => handleTextChange(config.key, data)}
              placeholder={`Share your thoughts about ${config.title.toLowerCase()}...`}
              className='min-h-[120px]'
            />
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

      <div className='flex justify-between'>
        <Button variant='outline' onClick={handlePrev}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={saving}>
          {saving ? 'Saving...' : 'Next: Work Hours'}
        </Button>
      </div>
    </div>
  )
}
