import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.cron(
  'send weekly reminders',
  '0,15,30,45 * * * *', // every 15 minutes, UTC
  internal.resend.weeklyReminderCron,
  {}
)

export default crons
