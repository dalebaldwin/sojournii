export const TIMELINE_EVENT_TYPES = {
  // User milestones
  JOINED_SOJOURNII: 'joined_sojournii',
  NEW_EMPLOYER: 'new_employer',

  // Goal events
  GOAL_CREATED: 'goal_created',
  GOAL_STATUS_CHANGED: 'goal_status_changed',
  GOAL_UPDATED: 'goal_updated',
  GOAL_DELETED: 'goal_deleted',

  // Goal milestone events
  GOAL_MILESTONE_CREATED: 'goal_milestone_created',
  GOAL_MILESTONE_STATUS_CHANGED: 'goal_milestone_status_changed',
  GOAL_MILESTONE_UPDATED: 'goal_milestone_updated',
  GOAL_MILESTONE_DELETED: 'goal_milestone_deleted',

  // User update events
  USER_GOAL_UPDATE: 'user_goal_update',
} as const

export type TimelineEventType =
  (typeof TIMELINE_EVENT_TYPES)[keyof typeof TIMELINE_EVENT_TYPES]

export const TIMELINE_EVENT_LABELS: Record<TimelineEventType, string> = {
  [TIMELINE_EVENT_TYPES.JOINED_SOJOURNII]: 'Joined Sojournii',
  [TIMELINE_EVENT_TYPES.NEW_EMPLOYER]: 'New Employer',
  [TIMELINE_EVENT_TYPES.GOAL_CREATED]: 'Goal Created',
  [TIMELINE_EVENT_TYPES.GOAL_STATUS_CHANGED]: 'Goal Status Changed',
  [TIMELINE_EVENT_TYPES.GOAL_UPDATED]: 'Goal Updated',
  [TIMELINE_EVENT_TYPES.GOAL_DELETED]: 'Goal Deleted',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_CREATED]: 'Milestone Created',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_STATUS_CHANGED]:
    'Milestone Status Changed',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_UPDATED]: 'Milestone Updated',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_DELETED]: 'Milestone Deleted',
  [TIMELINE_EVENT_TYPES.USER_GOAL_UPDATE]: 'Progress Update',
}

export const TIMELINE_EVENT_COLORS: Record<TimelineEventType, string> = {
  [TIMELINE_EVENT_TYPES.JOINED_SOJOURNII]: 'blue',
  [TIMELINE_EVENT_TYPES.NEW_EMPLOYER]: 'purple',
  [TIMELINE_EVENT_TYPES.GOAL_CREATED]: 'green',
  [TIMELINE_EVENT_TYPES.GOAL_STATUS_CHANGED]: 'orange',
  [TIMELINE_EVENT_TYPES.GOAL_UPDATED]: 'blue',
  [TIMELINE_EVENT_TYPES.GOAL_DELETED]: 'red',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_CREATED]: 'green',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_STATUS_CHANGED]: 'orange',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_UPDATED]: 'blue',
  [TIMELINE_EVENT_TYPES.GOAL_MILESTONE_DELETED]: 'red',
  [TIMELINE_EVENT_TYPES.USER_GOAL_UPDATE]: 'indigo',
}
