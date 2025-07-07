export const MILESTONE_EVENTS = {
  JOINED_SOJOURNII: 'joined_sojournii',
  NEW_EMPLOYER: 'new_employer',
} as const

export type MilestoneEvent =
  (typeof MILESTONE_EVENTS)[keyof typeof MILESTONE_EVENTS]

export const MILESTONE_EVENT_LABELS: Record<MilestoneEvent, string> = {
  [MILESTONE_EVENTS.JOINED_SOJOURNII]: 'Joined Sojournii',
  [MILESTONE_EVENTS.NEW_EMPLOYER]: 'New Employer',
}

// Mapping for migration from old number-based events to new string literals
export const MILESTONE_EVENT_MIGRATION_MAP: Record<number, MilestoneEvent> = {
  0: 'joined_sojournii',
  1: 'new_employer',
}
