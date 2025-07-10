/**
 * Convert 12-hour time to 24-hour time
 * @param hour - Hour in 12-hour format (1-12)
 * @param amPm - AM or PM
 * @returns Hour in 24-hour format (0-23)
 */
export const convertTo24Hour = (hour: number, amPm: 'AM' | 'PM'): number => {
  if (amPm === 'AM') {
    return hour === 12 ? 0 : hour
  } else {
    return hour === 12 ? 12 : hour + 12
  }
}

/**
 * Convert 24-hour time to 12-hour time
 * @param hour24 - Hour in 24-hour format (0-23)
 * @returns Object with hour (1-12) and amPm ('AM' | 'PM')
 */
export const convertTo12Hour = (
  hour24: number
): { hour: number; amPm: 'AM' | 'PM' } => {
  if (hour24 === 0) return { hour: 12, amPm: 'AM' }
  if (hour24 === 12) return { hour: 12, amPm: 'PM' }
  if (hour24 > 12) return { hour: hour24 - 12, amPm: 'PM' }
  return { hour: hour24, amPm: 'AM' }
}

/**
 * Check if a year is a leap year
 * @param year - Year to check
 * @returns True if leap year, false otherwise
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Get the number of days in a month
 * @param year - Year (for leap year calculation)
 * @param month - Month (1-12)
 * @returns Number of days in the month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  if (month === 2 && isLeapYear(year)) {
    return 29
  }

  return daysInMonth[month - 1] || 31
}

/**
 * Validate a date (year, month, day)
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @returns True if valid date, false otherwise
 */
export const isValidDate = (
  year: number,
  month: number,
  day: number
): boolean => {
  if (year < 1900 || year > 2100) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > getDaysInMonth(year, month)) return false
  return true
}

/**
 * Get array of years for select dropdown
 * @param startYear - Start year (default: 1900)
 * @param endYear - End year (default: current year + 10)
 * @returns Array of year objects with value and label
 */
export const getYearOptions = (
  startYear: number = 1900,
  endYear?: number
): Array<{ value: number; label: string }> => {
  const currentYear = new Date().getFullYear()
  const end = endYear || currentYear + 10

  return Array.from({ length: end - startYear + 1 }, (_, i) => {
    const year = startYear + i
    return { value: year, label: year.toString() }
  }).reverse() // Most recent years first
}

/**
 * Get array of months for select dropdown
 * @returns Array of month objects with value and label
 */
export const getMonthOptions = (): Array<{ value: number; label: string }> => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return months.map((month, index) => ({
    value: index + 1,
    label: month,
  }))
}

/**
 * Get array of days for select dropdown based on year and month
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Array of day objects with value and label
 */
export const getDayOptions = (
  year: number,
  month: number
): Array<{ value: number; label: string }> => {
  const daysInMonth = getDaysInMonth(year, month)

  return Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString(),
  }))
}

// =============================================================================
// TIMEZONE-AWARE DATE FUNCTIONS
// =============================================================================

/**
 * Convert a Date object to a timezone-aware timestamp for storage
 * This function takes a Date object (which represents a moment in time in the user's local timezone)
 * and converts it to a Unix timestamp for storage in the database
 * @param date - Date object in user's local timezone
 * @returns Unix timestamp (number of milliseconds since epoch)
 */
export const dateToTimestamp = (date: Date): number => {
  return date.getTime()
}

/**
 * Convert a stored timestamp to a Date object in user's timezone
 * This function takes a stored Unix timestamp and converts it to a Date object
 * that represents the same moment in time
 * @param timestamp - Unix timestamp from database
 * @returns Date object representing the same moment in time
 */
export const timestampToDate = (timestamp: number): Date => {
  return new Date(timestamp)
}

/**
 * Create a Date object representing a date in a specific timezone
 * This is useful for creating dates that should be interpreted in the user's timezone
 * @param year - Year
 * @param month - Month (1-12, not 0-11)
 * @param day - Day of month
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York')
 * @returns Date object representing the date at midnight in the specified timezone
 */
export const createDateInTimezone = (
  year: number,
  month: number,
  day: number,
  timezone: string
): Date => {
  try {
    // For UTC, we can create the date directly
    if (timezone === 'UTC') {
      return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    }

    // For other timezones, create a date and adjust for timezone offset
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0)
    return localDate
  } catch {
    // Fallback: create date assuming local timezone
    return new Date(year, month - 1, day)
  }
}

/**
 * Get the timezone offset in minutes for a specific timezone at a given date
 * @param timezone - IANA timezone identifier
 * @param date - Date to get offset for (defaults to current date)
 * @returns Offset in minutes from UTC (positive for behind UTC, negative for ahead)
 */
export const getTimezoneOffset = (
  timezone: string,
  date: Date = new Date()
): number => {
  try {
    // Create formatters for UTC and target timezone
    const utcFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    const targetFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    // Parse the formatted times
    const utcString = utcFormatter.format(date).replace(/[^\d]/g, '')
    const targetString = targetFormatter.format(date).replace(/[^\d]/g, '')

    // Create date objects from the strings
    const utcParsed = new Date(
      parseInt(utcString.slice(0, 4)), // year
      parseInt(utcString.slice(4, 6)) - 1, // month (0-indexed)
      parseInt(utcString.slice(6, 8)), // day
      parseInt(utcString.slice(8, 10)), // hour
      parseInt(utcString.slice(10, 12)), // minute
      parseInt(utcString.slice(12, 14)) // second
    )

    const targetParsed = new Date(
      parseInt(targetString.slice(0, 4)), // year
      parseInt(targetString.slice(4, 6)) - 1, // month (0-indexed)
      parseInt(targetString.slice(6, 8)), // day
      parseInt(targetString.slice(8, 10)), // hour
      parseInt(targetString.slice(10, 12)), // minute
      parseInt(targetString.slice(12, 14)) // second
    )

    // Calculate the difference in minutes
    return (utcParsed.getTime() - targetParsed.getTime()) / (1000 * 60)
  } catch {
    console.warn(`Invalid timezone: ${timezone}`)
    return 0
  }
}

/**
 * Format a timestamp for display in the user's timezone
 * @param timestamp - Unix timestamp from database
 * @param userTimezone - User's preferred timezone
 * @param format - Format string (default: 'MMMM d, yyyy')
 * @returns Formatted date string
 */
export const formatTimestampInTimezone = (
  timestamp: number,
  userTimezone: string,
  format: string = 'MMMM d, yyyy'
): string => {
  try {
    const date = new Date(timestamp)

    // Format the date in the user's timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    // Custom formatting based on format string
    if (format === 'MMM d, yyyy') {
      options.month = 'short'
    }

    return new Intl.DateTimeFormat('en-US', options).format(date)
  } catch (error) {
    console.warn(
      `Error formatting timestamp in timezone ${userTimezone}:`,
      error
    )
    return new Date(timestamp).toLocaleDateString()
  }
}

/**
 * Check if a date (in user's timezone) is before another date
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is before date2
 */
export const isDateBefore = (date1: Date, date2: Date): boolean => {
  return date1.getTime() < date2.getTime()
}

/**
 * Check if a date (in user's timezone) is after another date
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is after date2
 */
export const isDateAfter = (date1: Date, date2: Date): boolean => {
  return date1.getTime() > date2.getTime()
}

/**
 * Check if two dates represent the same day (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same day (in UTC)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  )
}

/**
 * Get the start of day (midnight) for a date in a specific timezone
 * @param date - Date to get start of day for
 * @param timezone - IANA timezone identifier
 * @returns Date object representing midnight in the specified timezone
 */
export const getStartOfDayInTimezone = (date: Date, timezone: string): Date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return createDateInTimezone(year, month, day, timezone)
}

/**
 * Get the end of day (11:59:59.999 PM) for a date in a specific timezone
 * @param date - Date to get end of day for
 * @param timezone - IANA timezone identifier
 * @returns Date object representing end of day in the specified timezone
 */
export const getEndOfDayInTimezone = (date: Date, timezone: string): Date => {
  const startOfDay = getStartOfDayInTimezone(date, timezone)
  return new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
}

/**
 * Get tomorrow's date in a specific timezone
 * @param timezone - IANA timezone identifier
 * @returns Date object representing tomorrow at midnight in the specified timezone
 */
export const getTomorrowInTimezone = (timezone: string): Date => {
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  return getStartOfDayInTimezone(tomorrow, timezone)
}

/**
 * Get today's date in a specific timezone
 * @param timezone - IANA timezone identifier
 * @returns Date object representing today at midnight in the specified timezone
 */
export const getTodayInTimezone = (timezone: string): Date => {
  const today = new Date()
  return getStartOfDayInTimezone(today, timezone)
}

/**
 * Convert a Date object selected in the browser to a timezone-aware timestamp for storage
 * This ensures that a date selected in the UI represents the same calendar date in the user's timezone
 * @param selectedDate - Date object selected by the user (represents a calendar date)
 * @param userTimezone - User's preferred timezone
 * @returns Unix timestamp representing the start of the selected day in the user's timezone
 */
export const convertSelectedDateToTimestamp = (
  selectedDate: Date,
  userTimezone: string
): number => {
  try {
    // Get the year, month, and day from the selected date
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
    const day = selectedDate.getDate()

    // Create a date representing the start of that day in the user's timezone
    const dateInUserTimezone = createDateInTimezone(
      year,
      month,
      day,
      userTimezone
    )

    return dateInUserTimezone.getTime()
  } catch (error) {
    console.warn('Error converting selected date to timestamp:', error)
    // Fallback: use the selected date as-is
    return selectedDate.getTime()
  }
}

// =============================================================================
// WEEK CALCULATION FUNCTIONS
// =============================================================================

export interface WeekInfo {
  startDate: Date
  endDate: Date
  weekDays: Date[]
}

export interface DayInfo {
  date: Date
  dayName: string
  dayNameShort: string
  dateString: string // YYYY-MM-DD format
  isPast: boolean
  isToday: boolean
  isFuture: boolean
}

/**
 * Get the current week starting from Monday
 * @param referenceDate - Date to calculate week from (defaults to today in user's timezone)
 * @param userTimezone - User's timezone (optional, defaults to browser timezone)
 * @returns WeekInfo object with start date, end date, and all days
 */
export const getCurrentWeek = (
  referenceDate?: Date,
  userTimezone?: string
): WeekInfo => {
  // If no reference date provided, use today in user's timezone
  let date: Date
  if (referenceDate) {
    date = new Date(referenceDate)
  } else {
    const timezone =
      userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    date = getTodayInTimezone(timezone)
  }

  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay()

  // Calculate how many days to subtract to get to Monday
  // If it's Sunday (0), we need to go back 6 days to get to Monday
  // If it's Monday (1), we need to go back 0 days
  // If it's Tuesday (2), we need to go back 1 day, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  // Get Monday of this week
  const startDate = new Date(date)
  startDate.setDate(date.getDate() - daysToSubtract)
  startDate.setHours(0, 0, 0, 0)

  // Get Sunday of this week (6 days after Monday)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  endDate.setHours(23, 59, 59, 999)

  // Generate all 7 days of the week
  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    weekDays.push(day)
  }

  return {
    startDate,
    endDate,
    weekDays,
  }
}

/**
 * Get detailed information for each day in the current week
 * @param referenceDate - Date to calculate week from (defaults to today in user's timezone)
 * @param userTimezone - User's timezone (optional, defaults to browser timezone)
 * @returns Array of DayInfo objects for each day of the week
 */
export const getWeekDaysInfo = (
  referenceDate?: Date,
  userTimezone?: string
): DayInfo[] => {
  const week = getCurrentWeek(referenceDate, userTimezone)
  const timezone =
    userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const today = getTodayInTimezone(timezone)
  today.setHours(0, 0, 0, 0)

  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]
  const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return week.weekDays.map((day, index) => {
    const dayDate = new Date(day)
    dayDate.setHours(0, 0, 0, 0)

    const todayDate = new Date(today)
    todayDate.setHours(0, 0, 0, 0)

    return {
      date: day,
      dayName: dayNames[index],
      dayNameShort: dayNamesShort[index],
      dateString: formatDateForDB(day),
      isPast: dayDate < todayDate,
      isToday: dayDate.getTime() === todayDate.getTime(),
      isFuture: dayDate > todayDate,
    }
  })
}

/**
 * Format date for database storage (YYYY-MM-DD)
 * This function formats the date as it appears in the local calendar,
 * which is what we want for week-based calculations
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date for display (e.g., "Dec 16")
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format week range for display (e.g., "Dec 16 - Dec 22, 2024")
 * @param startDate - Start of week
 * @param endDate - End of week
 * @returns Formatted week range string
 */
export const formatWeekRange = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const end = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `${start} - ${end}`
}

/**
 * Check if a date is editable (not in the future)
 * @param date - Date to check
 * @returns True if date is today or in the past
 */
export const isDateEditable = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)

  return checkDate <= today
}
