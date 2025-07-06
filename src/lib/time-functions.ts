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
