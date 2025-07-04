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
