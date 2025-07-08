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
  | 'workHours'
  | 'employer'
  | 'performanceQuestions'
  | 'confirmation'
  | 'ready'

export interface PerformanceQuestion {
  title: string
  description: string
  description_html?: string
  description_json?: string
}

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
  performanceQuestions: PerformanceQuestion[]
  work_hours: number
  work_minutes: number
  work_start_hour: number
  work_start_minute: number
  work_start_am_pm: 'AM' | 'PM'
  work_end_hour: number
  work_end_minute: number
  work_end_am_pm: 'AM' | 'PM'
  default_work_from_home: boolean
  break_hours: number
  break_minutes: number
  employers?: Array<{
    employer_name: string
    start_year?: number
    start_month?: number
    start_day?: number
    end_year?: number
    end_month?: number
    end_day?: number
  }>
}

export const defaultPerformanceQuestions: PerformanceQuestion[] = [
  {
    title: 'Results & Outcomes (Impact, Goals, Deliverables)',
    description:
      'What were your most significant accomplishments during this performance cycle?',
    description_html:
      '<p>What were your most significant accomplishments during this performance cycle?</p>',
    description_json: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'What were your most significant accomplishments during this performance cycle?',
            },
          ],
        },
      ],
    }),
  },
  {
    title: 'Values & Behaviors (Company Values, Collaboration, Ethics)',
    description:
      'Which company values did you demonstrate most strongly in your work? Provide examples.',
    description_html:
      '<p>Which company values did you demonstrate most strongly in your work? Provide examples.</p>',
    description_json: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Which company values did you demonstrate most strongly in your work? Provide examples.',
            },
          ],
        },
      ],
    }),
  },
  {
    title: 'Skills & Growth (Capabilities, Development, Learning)',
    description:
      'What new skills or knowledge have you developed in this period?',
    description_html:
      '<p>What new skills or knowledge have you developed in this period?</p>',
    description_json: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'What new skills or knowledge have you developed in this period?',
            },
          ],
        },
      ],
    }),
  },
  {
    title: 'Future Focus (Goals, Aspirations, Support)',
    description:
      'What goals or priorities would you like to focus on in the next cycle?',
    description_html:
      '<p>What goals or priorities would you like to focus on in the next cycle?</p>',
    description_json: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'What goals or priorities would you like to focus on in the next cycle?',
            },
          ],
        },
      ],
    }),
  },
]
