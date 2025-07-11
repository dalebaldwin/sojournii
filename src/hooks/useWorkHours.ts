import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export interface WorkHourEntry {
  _id: string
  user_id: string
  date: string
  work_hours: number
  work_minutes: number
  work_location?: 'home' | 'office' | 'hybrid'
  work_from_home?: boolean
  break_hours?: number
  break_minutes?: number
  notes?: string
  created_at: number
  updated_at: number
}

export interface WorkHoursSummary {
  totalHours: number
  totalMinutes: number
  totalWFHHours: number
  totalWFHMinutes: number
  totalOfficeHours: number
  totalOfficeMinutes: number
  totalBreakHours: number
  totalBreakMinutes: number
  totalFormattedHours: string
  totalWFHFormattedHours: string
  totalOfficeFormattedHours: string
  totalBreakFormattedHours: string
}

// Hook to get work hours by date range
export function useWorkHoursByDateRange(startDate: string, endDate: string) {
  const { isAuthenticated } = useConvexAuth()

  return useQuery(
    api.workHours.getWorkHoursByDateRange,
    isAuthenticated ? { startDate, endDate } : 'skip'
  )
}

// Hook to get work hours for a specific date
export function useWorkHourByDate(date: string) {
  const { isAuthenticated } = useConvexAuth()

  return useQuery(
    api.workHours.getWorkHourByDate,
    isAuthenticated ? { date } : 'skip'
  )
}

// Hook to get work hours summary for a date range
export function useWorkHoursSummary(
  startDate: string,
  endDate: string
): WorkHoursSummary | null {
  const workHours = useWorkHoursByDateRange(startDate, endDate)

  if (!workHours) return null

  const summary = workHours.reduce(
    (acc, entry) => {
      const isWFH = entry.work_location === 'home' || entry.work_from_home
      const isOffice = entry.work_location === 'office'
      const isHybrid = entry.work_location === 'hybrid'

      // Total hours
      acc.totalHours += entry.work_hours
      acc.totalMinutes += entry.work_minutes

      // Break hours
      acc.totalBreakHours += entry.break_hours || 0
      acc.totalBreakMinutes += entry.break_minutes || 0

      // Location-specific hours
      if (isWFH) {
        acc.totalWFHHours += entry.work_hours
        acc.totalWFHMinutes += entry.work_minutes
      } else if (isOffice) {
        acc.totalOfficeHours += entry.work_hours
        acc.totalOfficeMinutes += entry.work_minutes
      } else if (isHybrid) {
        // For hybrid, we'll split evenly between home and office
        // In a real implementation, you might want to track this more precisely
        const halfHours = Math.floor(entry.work_hours / 2)
        const halfMinutes = Math.floor(entry.work_minutes / 2)

        acc.totalWFHHours += halfHours
        acc.totalWFHMinutes += halfMinutes
        acc.totalOfficeHours += entry.work_hours - halfHours
        acc.totalOfficeMinutes += entry.work_minutes - halfMinutes
      }

      return acc
    },
    {
      totalHours: 0,
      totalMinutes: 0,
      totalWFHHours: 0,
      totalWFHMinutes: 0,
      totalOfficeHours: 0,
      totalOfficeMinutes: 0,
      totalBreakHours: 0,
      totalBreakMinutes: 0,
    }
  )

  // Convert minutes to hours where needed
  const convertToHours = (hours: number, minutes: number) => {
    const totalMinutes = hours * 60 + minutes
    const finalHours = Math.floor(totalMinutes / 60)
    const finalMinutes = totalMinutes % 60
    return { hours: finalHours, minutes: finalMinutes }
  }

  const total = convertToHours(summary.totalHours, summary.totalMinutes)
  const wfh = convertToHours(summary.totalWFHHours, summary.totalWFHMinutes)
  const office = convertToHours(
    summary.totalOfficeHours,
    summary.totalOfficeMinutes
  )
  const breaks = convertToHours(
    summary.totalBreakHours,
    summary.totalBreakMinutes
  )

  const formatHours = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return '0h'
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  return {
    totalHours: total.hours,
    totalMinutes: total.minutes,
    totalWFHHours: wfh.hours,
    totalWFHMinutes: wfh.minutes,
    totalOfficeHours: office.hours,
    totalOfficeMinutes: office.minutes,
    totalBreakHours: breaks.hours,
    totalBreakMinutes: breaks.minutes,
    totalFormattedHours: formatHours(total.hours, total.minutes),
    totalWFHFormattedHours: formatHours(wfh.hours, wfh.minutes),
    totalOfficeFormattedHours: formatHours(office.hours, office.minutes),
    totalBreakFormattedHours: formatHours(breaks.hours, breaks.minutes),
  }
}
