export const MILESTONE_EVENTS = {
  JOINED_SOJOURNII: 0,
  NEW_JOB: 1,
} as const

export type MilestoneEvent =
  (typeof MILESTONE_EVENTS)[keyof typeof MILESTONE_EVENTS]

export const MILESTONE_EVENT_LABELS: Record<MilestoneEvent, string> = {
  [MILESTONE_EVENTS.JOINED_SOJOURNII]: 'Joined Sojournii',
  [MILESTONE_EVENTS.NEW_JOB]: 'New Job',
}
