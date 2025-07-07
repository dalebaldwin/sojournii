'use client'

import { Heading } from '@/components/ui/heading'
import { TiptapRenderer } from '@/components/ui/tiptap-renderer'
import { useUserTimezone } from '@/hooks/useAccountSettings'
import {
  TIMELINE_EVENT_COLORS,
  TIMELINE_EVENT_LABELS,
} from '@/lib/milestone-events'
import { formatTimestampInTimezone } from '@/lib/time-functions'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { Calendar, Clock, Goal, Target, User } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'

export default function TimelinePage() {
  const { user, isLoaded } = useUser()
  const userTimezone = useUserTimezone()

  const timelineEvents = useQuery(api.timeline.getUserTimelineEvents, {})

  if (!isLoaded || !user) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  if (timelineEvents === undefined) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading timeline...
      </div>
    )
  }

  const getEventColor = (eventType: string) => {
    return (
      TIMELINE_EVENT_COLORS[eventType as keyof typeof TIMELINE_EVENT_COLORS] ||
      'gray'
    )
  }

  const getEventLabel = (eventType: string) => {
    return (
      TIMELINE_EVENT_LABELS[eventType as keyof typeof TIMELINE_EVENT_LABELS] ||
      eventType
    )
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal_created':
      case 'goal_updated':
      case 'goal_completed':
        return Goal
      case 'milestone_created':
      case 'milestone_updated':
      case 'milestone_completed':
        return Target
      case 'user_update':
        return User
      default:
        return Calendar
    }
  }

  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-4xl p-6'>
        {/* Header */}
        <div className='mb-8'>
          <Heading level='h1' weight='bold' className='mb-2'>
            Timeline
          </Heading>
          <p className='text-muted-foreground text-lg'>
            Track your progress across all goals and milestones
          </p>
        </div>

        {/* Timeline Events */}
        <div className='space-y-4'>
          {timelineEvents && timelineEvents.length > 0 ? (
            timelineEvents.map(event => {
              const EventIcon = getEventIcon(event.event_type)
              const eventColor = getEventColor(event.event_type)

              return (
                <div
                  key={event._id}
                  className='bg-muted/30 flex gap-4 rounded-lg border p-4'
                >
                  <div className='flex-shrink-0'>
                    <div
                      className={`bg-${eventColor}-500 flex h-10 w-10 items-center justify-center rounded-full`}
                    >
                      <EventIcon className='h-5 w-5 text-white' />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div>
                        <h4 className='text-sm font-medium'>
                          {event.title || getEventLabel(event.event_type)}
                        </h4>
                        <p className='text-muted-foreground text-xs'>
                          {formatTimestampInTimezone(
                            event.created_at,
                            userTimezone,
                            'MMM d, yyyy h:mm a'
                          )}
                        </p>
                      </div>
                      <div
                        className={`bg-${eventColor}-100 text-${eventColor}-800 rounded-full px-2 py-0.5 text-xs`}
                      >
                        {getEventLabel(event.event_type)}
                      </div>
                    </div>

                    {event.description && (
                      <div className='text-muted-foreground text-sm'>
                        {event.description_html ? (
                          <TiptapRenderer
                            content={event.description_html}
                            fallback={event.description}
                            className='prose-sm'
                          />
                        ) : (
                          event.description
                        )}
                      </div>
                    )}

                    {event.previous_value && event.new_value && (
                      <div className='text-muted-foreground mt-2 text-xs'>
                        <span className='line-through'>
                          {event.previous_value}
                        </span>
                        <span className='mx-2'>→</span>
                        <span className='font-medium'>{event.new_value}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className='py-12 text-center'>
              <Clock className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
              <h3 className='text-muted-foreground mb-2 text-lg font-medium'>
                No activity yet
              </h3>
              <p className='text-muted-foreground'>
                Create a goal or add a milestone to start tracking your
                progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
