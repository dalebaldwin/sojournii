// Clerk user type definition
export interface ClerkUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
  primaryEmailAddress?: {
    emailAddress?: string | null
  } | null
}

// Timezone type definition
export interface Timezone {
  value: string
  label: string
  city: string
  country: string
}

// Goal types
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface Goal {
  _id: string
  user_id: string
  name: string
  description: string
  description_html?: string
  description_json?: string
  target_date?: number
  status: GoalStatus
  created_at: number
  updated_at: number
}

export interface GoalMilestone {
  _id: string // ID from goal_milestones table
  goal_id: string
  user_id: string
  name: string
  description: string
  description_html?: string
  description_json?: string
  target_date?: number
  status: MilestoneStatus
  order: number
  created_at: number
  updated_at: number
}

// Data structure for the guided goal creation flow
export interface GoalData {
  name: string
  description: string
  description_html?: string
  description_json?: string
  target_date?: Date
  milestones: MilestoneData[]
}

export interface MilestoneData {
  name: string
  description: string
  description_html?: string
  description_json?: string
  target_date?: Date
  status?: MilestoneStatus
  order?: number
}

// Step type for the guided goal creation flow
export type GoalStep =
  | 'intro'
  | 'details'
  | 'date'
  | 'milestones'
  | 'confirmation'
