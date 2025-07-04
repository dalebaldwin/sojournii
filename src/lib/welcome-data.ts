export const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const

export const hours12 = [
  { value: 12, label: '12' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: '11' },
]

export const minutes = [
  { value: 0, label: '00' },
  { value: 15, label: '15' },
  { value: 30, label: '30' },
  { value: 45, label: '45' },
]

export const amPmOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
]

export type WelcomeStep =
  | 'welcome'
  | 'timezone'
  | 'reminders'
  | 'email'
  | 'confirmation'

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
