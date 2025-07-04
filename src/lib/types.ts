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

// Welcome data type definition
export interface WelcomeData {
  clerk_email: string
  notifications_email: string
  timezone: string
  weekly_reminder_day:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  weekly_reminder_hour: number
  weekly_reminder_minute: number
  weekly_reminder_am_pm: 'AM' | 'PM'
}
