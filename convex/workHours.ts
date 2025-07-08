import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get work hour entries for a user within a date range
export const getWorkHoursByDateRange = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('work_hour_entries')
      .withIndex('by_user', q => q.eq('user_id', identity.subject))
      .filter(q =>
        q.and(
          q.gte(q.field('date'), args.startDate),
          q.lte(q.field('date'), args.endDate)
        )
      )
      .collect()
  },
})

// Get work hour entry for a specific date
export const getWorkHourByDate = query({
  args: {
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('work_hour_entries')
      .withIndex('by_user_date', q =>
        q.eq('user_id', identity.subject).eq('date', args.date)
      )
      .first()
  },
})

// Create or update a work hour entry
export const upsertWorkHourEntry = mutation({
  args: {
    date: v.string(),
    work_start_hour: v.optional(v.number()),
    work_start_minute: v.optional(v.number()),
    work_start_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    work_end_hour: v.optional(v.number()),
    work_end_minute: v.optional(v.number()),
    work_end_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    // Hybrid work support - separate home and office times
    work_home_start_hour: v.optional(v.number()),
    work_home_start_minute: v.optional(v.number()),
    work_home_start_am_pm: v.optional(
      v.union(v.literal('AM'), v.literal('PM'))
    ),
    work_home_end_hour: v.optional(v.number()),
    work_home_end_minute: v.optional(v.number()),
    work_home_end_am_pm: v.optional(v.union(v.literal('AM'), v.literal('PM'))),
    work_office_start_hour: v.optional(v.number()),
    work_office_start_minute: v.optional(v.number()),
    work_office_start_am_pm: v.optional(
      v.union(v.literal('AM'), v.literal('PM'))
    ),
    work_office_end_hour: v.optional(v.number()),
    work_office_end_minute: v.optional(v.number()),
    work_office_end_am_pm: v.optional(
      v.union(v.literal('AM'), v.literal('PM'))
    ),
    work_location: v.optional(
      v.union(v.literal('home'), v.literal('office'), v.literal('hybrid'))
    ),
    break_hours: v.optional(v.number()),
    break_minutes: v.optional(v.number()),
    work_from_home: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Helper function to convert 12-hour to 24-hour format
    const convertTo24Hour = (hour: number, amPm: 'AM' | 'PM'): number => {
      if (hour === 12 && amPm === 'AM') return 0
      if (hour === 12 && amPm === 'PM') return 12
      if (amPm === 'PM') return hour + 12
      return hour
    }

    // Helper function to calculate work minutes from start/end times
    const calculateWorkMinutes = (
      startHour: number,
      startMinute: number,
      startAmPm: 'AM' | 'PM',
      endHour: number,
      endMinute: number,
      endAmPm: 'AM' | 'PM'
    ): number => {
      const startHour24 = convertTo24Hour(startHour, startAmPm)
      const endHour24 = convertTo24Hour(endHour, endAmPm)

      const startMinutes = startHour24 * 60 + startMinute
      const endMinutes = endHour24 * 60 + endMinute

      let totalMinutes = endMinutes - startMinutes

      // Handle case where end time is next day (rare but possible)
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60 // Add 24 hours
      }

      return Math.max(0, totalMinutes) // Ensure non-negative
    }

    // Calculate work hours and minutes based on work location
    let workHours = 0
    let workMinutes = 0

    if (args.work_location === 'hybrid') {
      // For hybrid work, calculate total from both home and office times
      let totalWorkMinutes = 0

      // Add home work time if provided
      if (
        args.work_home_start_hour !== undefined &&
        args.work_home_start_minute !== undefined &&
        args.work_home_start_am_pm &&
        args.work_home_end_hour !== undefined &&
        args.work_home_end_minute !== undefined &&
        args.work_home_end_am_pm
      ) {
        totalWorkMinutes += calculateWorkMinutes(
          args.work_home_start_hour,
          args.work_home_start_minute,
          args.work_home_start_am_pm,
          args.work_home_end_hour,
          args.work_home_end_minute,
          args.work_home_end_am_pm
        )
      }

      // Add office work time if provided
      if (
        args.work_office_start_hour !== undefined &&
        args.work_office_start_minute !== undefined &&
        args.work_office_start_am_pm &&
        args.work_office_end_hour !== undefined &&
        args.work_office_end_minute !== undefined &&
        args.work_office_end_am_pm
      ) {
        totalWorkMinutes += calculateWorkMinutes(
          args.work_office_start_hour,
          args.work_office_start_minute,
          args.work_office_start_am_pm,
          args.work_office_end_hour,
          args.work_office_end_minute,
          args.work_office_end_am_pm
        )
      }

      // Subtract break time from total
      const breakTimeMinutes =
        (args.break_hours || 0) * 60 + (args.break_minutes || 0)
      totalWorkMinutes -= breakTimeMinutes

      totalWorkMinutes = Math.max(0, totalWorkMinutes)
      workHours = Math.floor(totalWorkMinutes / 60)
      workMinutes = totalWorkMinutes % 60
    } else {
      // For single location (home or office), use the standard start/end times
      if (
        args.work_start_hour !== undefined &&
        args.work_start_minute !== undefined &&
        args.work_start_am_pm &&
        args.work_end_hour !== undefined &&
        args.work_end_minute !== undefined &&
        args.work_end_am_pm
      ) {
        const totalWorkMinutes = calculateWorkMinutes(
          args.work_start_hour,
          args.work_start_minute,
          args.work_start_am_pm,
          args.work_end_hour,
          args.work_end_minute,
          args.work_end_am_pm
        )

        // Subtract break time
        const breakTimeMinutes =
          (args.break_hours || 0) * 60 + (args.break_minutes || 0)
        const finalWorkMinutes = Math.max(
          0,
          totalWorkMinutes - breakTimeMinutes
        )

        workHours = Math.floor(finalWorkMinutes / 60)
        workMinutes = finalWorkMinutes % 60
      }
    }

    // Check if entry already exists for this date
    const existing = await ctx.db
      .query('work_hour_entries')
      .withIndex('by_user_date', q =>
        q.eq('user_id', identity.subject).eq('date', args.date)
      )
      .first()

    const now = Date.now()

    if (existing) {
      // Update existing entry
      return await ctx.db.patch(existing._id, {
        work_hours: workHours,
        work_minutes: workMinutes,
        work_start_hour: args.work_start_hour,
        work_start_minute: args.work_start_minute,
        work_start_am_pm: args.work_start_am_pm,
        work_end_hour: args.work_end_hour,
        work_end_minute: args.work_end_minute,
        work_end_am_pm: args.work_end_am_pm,
        work_home_start_hour: args.work_home_start_hour,
        work_home_start_minute: args.work_home_start_minute,
        work_home_start_am_pm: args.work_home_start_am_pm,
        work_home_end_hour: args.work_home_end_hour,
        work_home_end_minute: args.work_home_end_minute,
        work_home_end_am_pm: args.work_home_end_am_pm,
        work_office_start_hour: args.work_office_start_hour,
        work_office_start_minute: args.work_office_start_minute,
        work_office_start_am_pm: args.work_office_start_am_pm,
        work_office_end_hour: args.work_office_end_hour,
        work_office_end_minute: args.work_office_end_minute,
        work_office_end_am_pm: args.work_office_end_am_pm,
        work_location: args.work_location,
        break_hours: args.break_hours,
        break_minutes: args.break_minutes,
        work_from_home: args.work_from_home,
        notes: args.notes,
        updated_at: now,
      })
    } else {
      // Create new entry
      return await ctx.db.insert('work_hour_entries', {
        user_id: identity.subject,
        date: args.date,
        work_hours: workHours,
        work_minutes: workMinutes,
        work_start_hour: args.work_start_hour,
        work_start_minute: args.work_start_minute,
        work_start_am_pm: args.work_start_am_pm,
        work_end_hour: args.work_end_hour,
        work_end_minute: args.work_end_minute,
        work_end_am_pm: args.work_end_am_pm,
        work_home_start_hour: args.work_home_start_hour,
        work_home_start_minute: args.work_home_start_minute,
        work_home_start_am_pm: args.work_home_start_am_pm,
        work_home_end_hour: args.work_home_end_hour,
        work_home_end_minute: args.work_home_end_minute,
        work_home_end_am_pm: args.work_home_end_am_pm,
        work_office_start_hour: args.work_office_start_hour,
        work_office_start_minute: args.work_office_start_minute,
        work_office_start_am_pm: args.work_office_start_am_pm,
        work_office_end_hour: args.work_office_end_hour,
        work_office_end_minute: args.work_office_end_minute,
        work_office_end_am_pm: args.work_office_end_am_pm,
        work_location: args.work_location,
        break_hours: args.break_hours,
        break_minutes: args.break_minutes,
        work_from_home: args.work_from_home,
        notes: args.notes,
        created_at: now,
        updated_at: now,
      })
    }
  },
})

// Delete a work hour entry
export const deleteWorkHourEntry = mutation({
  args: {
    id: v.id('work_hour_entries'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get the existing entry to verify ownership
    const entry = await ctx.db.get(args.id)
    if (!entry) {
      throw new Error('Work hour entry not found')
    }

    if (entry.user_id !== identity.subject) {
      throw new Error('Not authorized to delete this entry')
    }

    return await ctx.db.delete(args.id)
  },
})
