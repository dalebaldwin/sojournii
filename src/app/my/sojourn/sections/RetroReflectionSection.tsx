'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import {
  useCreateRetro,
  useRetroByWeek,
  useUpdateRetro,
} from '@/hooks/useRetros'
import { JSONContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface RetroReflectionSectionProps {
  selectedWeek: {
    startDate: string
    endDate: string
    weekRange: string
  }
  reflectionKey: 'positive_outcomes' | 'negative_outcomes' | 'key_takeaways'
  title: string
  context: string
  nextStep: () => void
  prevStep: () => void
}

export function RetroReflectionSection({
  selectedWeek,
  reflectionKey,
  title,
  context,
  nextStep,
  prevStep,
}: RetroReflectionSectionProps) {
  const [textValues, setTextValues] = useState({
    text: '',
    html: '',
    json: '',
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
        text: existingRetro[reflectionKey] || '',
        html: existingRetro[`${reflectionKey}_html`] || '',
        json: existingRetro[`${reflectionKey}_json`] || '',
      })
    }
  }, [existingRetro, reflectionKey])

  const handleTextChange = (data: { html: string; json: JSONContent }) => {
    // Extract plain text from HTML for storage
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = data.html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    setTextValues({
      text: plainText,
      html: data.html,
      json: JSON.stringify(data.json),
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (existingRetro) {
        // Update existing retro
        await updateRetro({
          id: existingRetro._id,
          [reflectionKey]: textValues.text,
          [`${reflectionKey}_html`]: textValues.html,
          [`${reflectionKey}_json`]: textValues.json,
        })
      } else {
        // Create new retro with default values
        const defaultRetroData = {
          week_start_date: selectedWeek.startDate,
          // Default slider values
          general_feelings: 50,
          work_relationships: 50,
          professional_growth: 50,
          productivity: 50,
          personal_wellbeing: 50,
          // Default text values
          positive_outcomes: '',
          positive_outcomes_html: '',
          positive_outcomes_json: '',
          negative_outcomes: '',
          negative_outcomes_html: '',
          negative_outcomes_json: '',
          key_takeaways: '',
          key_takeaways_html: '',
          key_takeaways_json: '',
          // Override the specific reflection
          [reflectionKey]: textValues.text,
          [`${reflectionKey}_html`]: textValues.html,
          [`${reflectionKey}_json`]: textValues.json,
        }
        await createRetro(defaultRetroData)
      }
      setHasChanges(false)
      toast.success('Reflection saved successfully!')
    } catch (error) {
      console.error('Failed to save reflection:', error)
      toast.error('Failed to save reflection. Please try again.')
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
        <Heading level='h1' className='mb-4 text-3xl font-normal'>
          {title}
        </Heading>
        <p className='text-muted-foreground mb-6 text-lg'>{context}</p>
        <div className='mb-6 text-xl font-semibold'>
          {selectedWeek.weekRange}
        </div>
      </div>

      <div className='space-y-8'>
        <TiptapEditor
          content={textValues.json || textValues.text || ''}
          onUpdate={handleTextChange}
          placeholder={`Share your thoughts about ${title.toLowerCase()}...`}
          className='min-h-[200px]'
        />

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
