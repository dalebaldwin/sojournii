import { v } from 'convex/values'
import { addWeeks } from 'date-fns'
import { internal } from './_generated/api'
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server'

// Resend webhook handler
export const resendWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get('resend-signature')
  const body = await request.text()

  // Verify webhook signature
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('RESEND_WEBHOOK_SECRET not configured')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Basic signature verification (you may want to implement proper HMAC verification)
  if (!signature) {
    console.warn(
      'No signature provided - webhook security disabled for testing'
    )
    // For testing, we'll allow webhooks without signatures
    // TODO: Re-enable signature verification in production
  }

  let event
  try {
    event = JSON.parse(body)
  } catch (error) {
    console.error('Invalid JSON payload:', error)
    return new Response('Invalid JSON payload', { status: 400 })
  }

  console.log('Received Resend webhook event:', event.type)

  // Handle different event types
  switch (event.type) {
    case 'email.delivered':
      await ctx.runAction(internal.resend.handleEmailDelivered, {
        event: event.data,
      })
      break

    case 'email.bounced':
      await ctx.runAction(internal.resend.handleEmailBounced, {
        event: event.data,
      })
      break

    case 'email.complained':
      await ctx.runAction(internal.resend.handleEmailComplained, {
        event: event.data,
      })
      break

    case 'email.failed':
      await ctx.runAction(internal.resend.handleEmailFailed, {
        event: event.data,
      })
      break

    default:
      console.log('Unhandled event type:', event.type)
  }

  return new Response('OK', { status: 200 })
})

// Internal action to handle email.delivered event
export const handleEmailDelivered = internalAction({
  args: {
    event: v.any(),
  },
  handler: async (ctx, args) => {
    const { event } = args

    // Handle both string and array formats for event.to
    const emailAddress = Array.isArray(event.to) ? event.to[0] : event.to

    // Check if this is a welcome email by looking at the subject or metadata
    const isWelcomeEmail =
      event.subject?.includes('Welcome') ||
      event.tags?.includes('welcome') ||
      event.metadata?.type === 'welcome'

    if (isWelcomeEmail && event.to) {
      // Find the user by email and schedule their weekly reminder
      const user = await ctx.runQuery(internal.resend.getUserByEmail, {
        email: emailAddress,
      })

      if (user) {
        // Note: scheduleWeeklyReminder is now called directly from the frontend after onboarding
        // This webhook path is kept for backwards compatibility but may not be needed
        console.log(
          'User found for welcome email, but scheduling is now handled from frontend'
        )
      }
    }

    console.log('Email delivered successfully:', emailAddress)
  },
})

// Internal action to handle email.bounced event
export const handleEmailBounced = internalAction({
  args: {
    event: v.any(),
  },
  handler: async (ctx, args) => {
    const { event } = args
    const emailAddress = Array.isArray(event.to) ? event.to[0] : event.to
    console.log('Email bounced:', emailAddress, 'Reason:', event.reason)

    // Find the user and disable their email notifications
    const user = await ctx.runQuery(internal.resend.getUserByEmail, {
      email: emailAddress,
    })

    if (user) {
      await ctx.runMutation(internal.resend.disableEmailNotifications, {
        userId: user._id,
        reason: `Email bounced: ${event.reason || 'Unknown reason'}`,
      })
    } else {
      console.log('User not found for bounced email:', emailAddress)
    }
  },
})

// Internal action to handle email.complained event
export const handleEmailComplained = internalAction({
  args: {
    event: v.any(),
  },
  handler: async (ctx, args) => {
    const { event } = args
    const emailAddress = Array.isArray(event.to) ? event.to[0] : event.to
    console.log('Email complaint received:', emailAddress)

    // Find the user and disable their email notifications
    const user = await ctx.runQuery(internal.resend.getUserByEmail, {
      email: emailAddress,
    })

    if (user) {
      await ctx.runMutation(internal.resend.disableEmailNotifications, {
        userId: user._id,
        reason: 'Email complaint received - user marked as spam',
      })
    } else {
      console.log('User not found for email complaint:', emailAddress)
    }
  },
})

// Internal action to handle email.failed event
export const handleEmailFailed = internalAction({
  args: {
    event: v.any(),
  },
  handler: async (ctx, args) => {
    const { event } = args
    const emailAddress = Array.isArray(event.to) ? event.to[0] : event.to
    console.log('Email failed to send:', emailAddress, 'Error:', event.error)

    // For permanent failures, disable email notifications
    // Check if it's a permanent failure (vs temporary)
    const isPermanentFailure =
      event.error?.type === 'permanent' ||
      event.error?.includes('does not exist') ||
      event.error?.includes('invalid') ||
      event.error?.includes('rejected')

    if (isPermanentFailure) {
      // Find the user and disable their email notifications
      const user = await ctx.runQuery(internal.resend.getUserByEmail, {
        email: emailAddress,
      })

      if (user) {
        await ctx.runMutation(internal.resend.disableEmailNotifications, {
          userId: user._id,
          reason: `Email failed permanently: ${event.error || 'Unknown error'}`,
        })
      } else {
        console.log('User not found for failed email:', emailAddress)
      }
    } else {
      console.log('Email failed temporarily - not disabling notifications')
    }
  },
})

// Internal query to get user by email
export const getUserByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('account_settings')
      .withIndex('clerk_email', q => q.eq('clerk_email', args.email))
      .first()

    if (!user) {
      // Try notifications_email as fallback
      const userByNotifEmail = await ctx.db
        .query('account_settings')
        .filter(q => q.eq(q.field('notifications_email'), args.email))
        .first()

      return userByNotifEmail
    }

    return user
  },
})

// Internal action to schedule weekly reminder
export const scheduleWeeklyReminder = internalAction({
  args: {
    userId: v.id('account_settings'),
    email: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get user settings
    const userSettings: any = await ctx.runQuery(
      internal.resend.getUserSettings,
      {
        userId: args.userId,
      }
    )

    if (!userSettings || !userSettings.weekly_reminder) {
      console.log('Weekly reminder not enabled for user:', args.userId)
      return
    }

    // Calculate next reminder time based on timezone and preferences
    const nextReminderTime: Date = calculateNextReminderTime(
      userSettings.weekly_reminder_day,
      userSettings.weekly_reminder_hour,
      userSettings.weekly_reminder_minute,
      userSettings.weekly_reminder_time_zone
    )

    // Format the time for Resend API (ISO 8601 format)
    const scheduledAt: string = nextReminderTime.toISOString()

    console.log('Scheduling weekly reminder for:', {
      userId: args.userId,
      email: args.email,
      nextReminderTime: nextReminderTime,
      scheduledAt: scheduledAt,
      timezone: userSettings.weekly_reminder_time_zone,
    })

    // Actually schedule the email with Resend by calling the API directly
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const reminderEmailPayload: any = {
      from: 'onboarding@resend.dev',
      to: args.email,
      subject: 'Weekly Sojourn Reminder - Time to Reflect on Your Journey',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Your Weekly Sojourn Awaits</h1>
          
          <p>Hi ${userSettings.first_name || 'there'}!</p>
          
          <p>It's time for your weekly professional reflection. Take a few minutes to track your progress and celebrate your growth.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">This Week's Reflection:</h3>
            <ul style="color: #475569;">
              <li>Review your goals and milestones</li>
              <li>Track your work hours and productivity</li>
              <li>Reflect on your performance questions</li>
              <li>Note any achievements or challenges</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sojournii.com/my/sojourn" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Start Your Weekly Sojourn
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            This is your weekly reminder as requested. You can update your notification preferences in your 
            <a href="https://sojournii.com/my/settings" style="color: #2563eb;">account settings</a>.
          </p>
        </div>
      `,
      scheduled_at: scheduledAt,
    }

    try {
      const response: Response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(reminderEmailPayload),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Resend API error response:', errorData)
        throw new Error(
          `Failed to schedule weekly reminder email: ${response.status} ${errorData}`
        )
      }

      const result: any = await response.json()
      console.log('Weekly reminder scheduled successfully:', result)

      // Update user settings with the actual scheduled email ID from Resend
      await ctx.runMutation(internal.resend.updateScheduledReminderId, {
        userId: args.userId,
        scheduledId: result.id || `scheduled_${Date.now()}_${args.userId}`,
      })

      return result
    } catch (error) {
      console.error('Error scheduling weekly reminder:', error)

      // Still update with a fallback ID so we know scheduling was attempted
      await ctx.runMutation(internal.resend.updateScheduledReminderId, {
        userId: args.userId,
        scheduledId: `failed_${Date.now()}_${args.userId}`,
      })

      throw error
    }
  },
})

// Internal query to get user settings
export const getUserSettings = internalQuery({
  args: {
    userId: v.id('account_settings'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

// Internal mutation to update scheduled reminder ID
export const updateScheduledReminderId = internalMutation({
  args: {
    userId: v.id('account_settings'),
    scheduledId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      scheduled_weekly_reminder_id: args.scheduledId,
    })
  },
})

// Internal mutation to disable email notifications
export const disableEmailNotifications = internalMutation({
  args: {
    userId: v.id('account_settings'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      email_notifications_disabled: true,
    })
    console.log(
      `Email notifications disabled for user ${args.userId}. Reason: ${args.reason}`
    )
  },
})

// Action to re-enable email notifications (for user-initiated re-enabling)
export const enableEmailNotifications = action({
  args: {
    userId: v.id('account_settings'),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.resend.updateEmailNotificationStatus, {
      userId: args.userId,
      disabled: false,
    })
    console.log(`Email notifications re-enabled for user ${args.userId}`)
  },
})

// Internal mutation to update email notification status
export const updateEmailNotificationStatus = internalMutation({
  args: {
    userId: v.id('account_settings'),
    disabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      email_notifications_disabled: args.disabled,
    })
  },
})

// Send welcome email action
export const sendWelcomeEmail = action({
  args: {
    to: v.string(),
    firstName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Debug logging
    console.log('sendWelcomeEmail called with args:', args)
    console.log('Email to:', args.to)
    console.log('First name:', args.firstName)

    // Validate email address
    if (!args.to || typeof args.to !== 'string' || !args.to.includes('@')) {
      throw new Error(`Invalid email address: ${args.to}`)
    }

    // Check if email notifications are disabled for this user
    const user = await ctx.runQuery(internal.resend.getUserByEmail, {
      email: args.to,
    })

    if (user?.email_notifications_disabled) {
      console.log('Email notifications disabled for user:', args.to)
      return {
        skipped: true,
        reason: 'Email notifications disabled for this user',
      }
    }

    const welcomeEmailPayload = {
      from: 'onboarding@resend.dev',
      to: args.to,
      subject: 'Welcome to Sojournii!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to Sojournii!</h1>
          
          <p>Hi ${args.firstName || 'there'}!</p>
          
          <p>Thank you for joining Sojournii! We're excited to help you track your professional growth and reflect on your journey.</p>
          
          <p>Here's what you can expect:</p>
          <ul>
            <li>Weekly reminders to help you stay on track with your goals</li>
            <li>Performance reflection prompts to help you grow</li>
            <li>Tools to track your progress and celebrate your wins</li>
          </ul>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out.</p>
          
          <p>Happy journeying!<br>
          The Sojournii Team</p>
        </div>
      `,
    }

    // Debug the payload being sent
    console.log(
      'Sending welcome email payload:',
      JSON.stringify(welcomeEmailPayload, null, 2)
    )

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(welcomeEmailPayload),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Resend API error response:', errorData)
        console.error('Response status:', response.status)
        console.error(
          'Response headers:',
          Object.fromEntries(response.headers.entries())
        )
        throw new Error(
          `Failed to send welcome email: ${response.status} ${errorData}`
        )
      }

      const result = await response.json()
      console.log('Welcome email sent successfully:', result)
      return result
    } catch (error) {
      console.error('Error sending welcome email:', error)
      throw error
    }
  },
})

// Helper function to calculate next reminder time
function calculateNextReminderTime(
  day: string,
  hour: number,
  minute: number,
  timezone: string
): Date {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const targetDay = days.indexOf(day.toLowerCase())

  const now = new Date()
  const currentDay = now.getDay()

  // Calculate days until next occurrence
  let daysUntilTarget = (targetDay - currentDay + 7) % 7
  if (daysUntilTarget === 0) {
    // If it's the same day, check if the time has passed
    const targetTime = new Date(now)
    targetTime.setHours(hour, minute, 0, 0)

    if (targetTime <= now) {
      daysUntilTarget = 7 // Next week
    }
  }

  const nextReminder = new Date(now)
  nextReminder.setDate(now.getDate() + daysUntilTarget)
  nextReminder.setHours(hour, minute, 0, 0)

  // TODO: Implement proper timezone handling using the timezone parameter
  console.log('Timezone handling not implemented yet:', timezone)

  return nextReminder
}

// Send weekly reminder email action
export const sendWeeklyReminderEmail = action({
  args: {
    to: v.string(),
    firstName: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Check if email notifications are disabled for this user
    const user = await ctx.runQuery(internal.resend.getUserByEmail, {
      email: args.to,
    })

    if (user?.email_notifications_disabled) {
      console.log('Email notifications disabled for user:', args.to)
      return {
        skipped: true,
        reason: 'Email notifications disabled for this user',
      }
    }

    const reminderEmailPayload = {
      from: 'onboarding@resend.dev',
      to: args.to,
      subject: 'Weekly Sojourn Reminder - Time to Reflect on Your Journey',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Your Weekly Sojourn Awaits</h1>
          
          <p>Hi ${args.firstName || 'there'}!</p>
          
          <p>It's time for your weekly professional reflection. Take a few minutes to track your progress and celebrate your growth.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">This Week's Reflection:</h3>
            <ul style="color: #475569;">
              <li>Review your goals and milestones</li>
              <li>Track your work hours and productivity</li>
              <li>Reflect on your performance questions</li>
              <li>Note any achievements or challenges</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sojournii.com/my/sojourn" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Start Your Weekly Sojourn
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            This is your weekly reminder as requested. You can update your notification preferences in your 
            <a href="https://sojournii.com/my/settings" style="color: #2563eb;">account settings</a>.
          </p>
        </div>
      `,
      tags: ['weekly-reminder'],
      metadata: {
        type: 'weekly-reminder',
      },
      ...(args.scheduledAt && { scheduledAt: args.scheduledAt }),
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(reminderEmailPayload),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Resend API error response:', errorData)
        throw new Error(
          `Failed to send weekly reminder email: ${response.status} ${errorData}`
        )
      }

      const result = await response.json()
      console.log('Weekly reminder email scheduled successfully:', result)
      return result
    } catch (error) {
      console.error('Error sending weekly reminder email:', error)
      throw error
    }
  },
})

// Cron job: runs every 15 minutes
export const weeklyReminderCron = internalAction({
  args: {},
  handler: async ctx => {
    // Get current UTC time rounded down to the nearest 15 minutes
    const now = new Date()
    const minute = now.getMinutes() - (now.getMinutes() % 15)
    const windowStart = new Date(now)
    windowStart.setMinutes(minute, 0, 0)
    const windowEnd = new Date(windowStart.getTime() + 15 * 60 * 1000)

    // Query users whose next_weekly_reminder_utc is within this window
    const users = await ctx.db
      .query('account_settings')
      .withIndex('by_next_weekly_reminder_utc', q =>
        q
          .gte('next_weekly_reminder_utc', windowStart.getTime())
          .lt('next_weekly_reminder_utc', windowEnd.getTime())
      )
      .collect()

    for (const user of users) {
      if (user.email_notifications_disabled) continue
      // Send the reminder
      await ctx.scheduler.runAfter(0, internal.resend.sendWeeklyReminderEmail, {
        to: user.notifications_email || user.clerk_email,
        firstName: user.first_name,
      })
      // Update next_weekly_reminder_utc to next week
      const nextUtc = addWeeks(
        new Date(user.next_weekly_reminder_utc),
        1
      ).getTime()
      await ctx.db.patch(user._id, { next_weekly_reminder_utc: nextUtc })
    }
  },
})
