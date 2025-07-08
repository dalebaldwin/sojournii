'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Slider } from '@/components/ui/slider'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { useRetro, useUpdateRetro, type RetroFormData } from '@/hooks/useRetros'
import type { JSONContent } from '@tiptap/react'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Edit3, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Id } from '../../../../../convex/_generated/dataModel'

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

export default function RetroDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const retroId = params.id as string

  const retro = useRetro(retroId as Id<'retros'>)
  const updateRetro = useUpdateRetro()

  // Check if we should start in edit mode (for newly created retros or via query param)
  const shouldStartInEdit = searchParams.get('edit') === 'true'
  const [isEditing, setIsEditing] = useState(shouldStartInEdit)
  const [formData, setFormData] = useState<RetroFormData>({
    general_feelings: 50,
    work_relationships: 50,
    professional_growth: 50,
    productivity: 50,
    personal_wellbeing: 50,
    positive_outcomes: '',
    negative_outcomes: '',
    key_takeaways: '',
  })

  // Initialize form data when retro loads
  useEffect(() => {
    if (retro) {
      setFormData({
        general_feelings: retro.general_feelings,
        work_relationships: retro.work_relationships,
        professional_growth: retro.professional_growth,
        productivity: retro.productivity,
        personal_wellbeing: retro.personal_wellbeing,
        positive_outcomes: retro.positive_outcomes,
        positive_outcomes_html: retro.positive_outcomes_html,
        positive_outcomes_json: retro.positive_outcomes_json,
        negative_outcomes: retro.negative_outcomes,
        negative_outcomes_html: retro.negative_outcomes_html,
        negative_outcomes_json: retro.negative_outcomes_json,
        key_takeaways: retro.key_takeaways,
        key_takeaways_html: retro.key_takeaways_html,
        key_takeaways_json: retro.key_takeaways_json,
      })
    }
  }, [retro])

  const handleSliderChange = (key: keyof RetroFormData, value: number[]) => {
    setFormData(prev => ({ ...prev, [key]: value[0] }))
  }

  const handleTextChange = (
    key: keyof RetroFormData,
    data: { html: string; json: JSONContent }
  ) => {
    // Extract plain text from HTML for storage
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = data.html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    setFormData(prev => ({
      ...prev,
      [key]: plainText,
      [`${key}_html`]: data.html,
      [`${key}_json`]: JSON.stringify(data.json),
    }))
  }

  const handleSave = async () => {
    if (!retro) return

    try {
      await updateRetro({
        id: retro._id,
        ...formData,
      })
      setIsEditing(false)

      // Remove edit query parameter from URL after saving
      const url = new URL(window.location.href)
      url.searchParams.delete('edit')
      window.history.replaceState({}, '', url.toString())
    } catch (error) {
      console.error('Failed to update retro:', error)
    }
  }

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  if (!retro) {
    return (
      <div className='mx-auto max-w-4xl space-y-6 p-6'>
        <div className='py-8 text-center'>
          <div className='text-4xl'>🔍</div>
          <h2 className='mt-4 mb-2 text-xl font-semibold'>Retro Not Found</h2>
          <p className='text-muted-foreground mb-4'>
            The retro you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Link href='/my/retro'>
            <Button variant='outline' className='flex items-center space-x-2'>
              <ArrowLeft className='h-4 w-4' />
              <span>Back to Retros</span>
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <Link href='/my/retro'>
              <Button variant='outline' size='sm'>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </Link>
            <Heading level='h2' weight='bold' className='mb-0' showLines>
              Week of{' '}
              {formatWeekRange(retro.week_start_date, retro.week_end_date)}
            </Heading>
          </div>
          <p className='text-muted-foreground ml-12'>
            {retro.completed_at
              ? `Completed on ${format(new Date(retro.completed_at), 'MMMM d, yyyy')}`
              : `Draft started on ${format(new Date(retro.created_at), 'MMMM d, yyyy')}`}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className='flex items-center space-x-2'
              >
                <Save className='h-4 w-4' />
                <span>Save Changes</span>
              </Button>
              <Button variant='outline' onClick={() => setIsEditing(false)}>
                <X className='h-4 w-4' />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant='outline'
              className='flex items-center space-x-2'
            >
              <Edit3 className='h-4 w-4' />
              <span>Edit</span>
            </Button>
          )}
        </div>
      </div>

      {/* Slider Sections */}
      <div className='space-y-6'>
        <h2 className='text-lg font-semibold'>Weekly Ratings</h2>

        {sliderConfigs.map(config => (
          <div key={config.key} className='space-y-4 rounded-lg border p-6'>
            <div className='space-y-2'>
              <h3 className='font-semibold'>{config.title}</h3>
              <p className='text-muted-foreground text-sm'>{config.context}</p>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>Rating</span>
                <span className='text-lg font-bold'>
                  {formData[config.key]}/100
                </span>
              </div>

              {isEditing ? (
                <Slider
                  value={[formData[config.key]]}
                  onValueChange={value => handleSliderChange(config.key, value)}
                  max={100}
                  min={0}
                  step={1}
                  className='w-full'
                />
              ) : (
                <div className='relative w-full'>
                  <div className='bg-secondary h-2 w-full rounded-full'>
                    <div
                      className='bg-primary h-2 rounded-full'
                      style={{ width: `${formData[config.key]}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Text Sections */}
      <div className='space-y-6'>
        <h2 className='text-lg font-semibold'>Reflections</h2>

        {textConfigs.map(config => (
          <div key={config.key} className='space-y-4 rounded-lg border p-6'>
            <div className='space-y-2'>
              <h3 className='font-semibold'>{config.title}</h3>
              <p className='text-muted-foreground text-sm'>{config.context}</p>
            </div>

            {isEditing ? (
              <TiptapEditor
                content={formData[config.key]}
                onUpdate={data => handleTextChange(config.key, data)}
                placeholder={`Share your thoughts about ${config.title.toLowerCase()}...`}
                className='min-h-[150px]'
              />
            ) : (
              <div className='prose prose-sm dark:prose-invert max-w-none'>
                {formData[`${config.key}_json`] ? (
                  <TiptapRenderer
                    content={JSON.parse(
                      formData[`${config.key}_json`] as string
                    )}
                  />
                ) : formData[`${config.key}_html`] ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formData[`${config.key}_html`] as string,
                    }}
                  />
                ) : (
                  <p className='text-muted-foreground italic'>
                    {formData[config.key] ||
                      'No thoughts shared for this section.'}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Save Section - only show when editing */}
      {isEditing && (
        <div className='bg-muted/30 flex items-center justify-center gap-4 rounded-lg border p-6'>
          <Button onClick={handleSave} className='flex items-center space-x-2'>
            <Save className='h-4 w-4' />
            <span>Save Changes</span>
          </Button>
          <Button variant='outline' onClick={() => setIsEditing(false)}>
            <X className='h-4 w-4' />
            <span>Cancel</span>
          </Button>
        </div>
      )}
    </div>
  )
}
