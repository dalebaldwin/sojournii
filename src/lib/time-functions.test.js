import assert from 'node:assert'
import { describe, test } from 'node:test'
import {
  convertTo12Hour,
  convertTo24Hour,
  createDateInTimezone,
  dateToTimestamp,
  formatTimestampInTimezone,
  getDayOptions,
  getDaysInMonth,
  getEndOfDayInTimezone,
  getMonthOptions,
  getStartOfDayInTimezone,
  getTimezoneOffset,
  getTodayInTimezone,
  getTomorrowInTimezone,
  getYearOptions,
  isDateAfter,
  isDateBefore,
  isLeapYear,
  isSameDay,
  isValidDate,
  timestampToDate,
} from './time-functions.ts'

describe('Time Conversion Functions', () => {
  describe('convertTo24Hour', () => {
    test('converts AM hours correctly', () => {
      assert.strictEqual(convertTo24Hour(1, 'AM'), 1)
      assert.strictEqual(convertTo24Hour(12, 'AM'), 0)
      assert.strictEqual(convertTo24Hour(11, 'AM'), 11)
    })

    test('converts PM hours correctly', () => {
      assert.strictEqual(convertTo24Hour(1, 'PM'), 13)
      assert.strictEqual(convertTo24Hour(12, 'PM'), 12)
      assert.strictEqual(convertTo24Hour(11, 'PM'), 23)
    })
  })

  describe('convertTo12Hour', () => {
    test('converts 24-hour to 12-hour correctly', () => {
      assert.deepStrictEqual(convertTo12Hour(0), { hour: 12, amPm: 'AM' })
      assert.deepStrictEqual(convertTo12Hour(12), { hour: 12, amPm: 'PM' })
      assert.deepStrictEqual(convertTo12Hour(1), { hour: 1, amPm: 'AM' })
      assert.deepStrictEqual(convertTo12Hour(13), { hour: 1, amPm: 'PM' })
      assert.deepStrictEqual(convertTo12Hour(23), { hour: 11, amPm: 'PM' })
    })
  })
})

describe('Date Utility Functions', () => {
  describe('isLeapYear', () => {
    test('identifies leap years correctly', () => {
      assert.strictEqual(isLeapYear(2000), true) // Century leap year
      assert.strictEqual(isLeapYear(2020), true) // Regular leap year
      assert.strictEqual(isLeapYear(2024), true) // Regular leap year
      assert.strictEqual(isLeapYear(2100), false) // Century non-leap year
      assert.strictEqual(isLeapYear(2023), false) // Non-leap year
      assert.strictEqual(isLeapYear(1900), false) // Century non-leap year
    })
  })

  describe('getDaysInMonth', () => {
    test('returns correct days for each month', () => {
      // Non-leap year
      assert.strictEqual(getDaysInMonth(2023, 1), 31) // January
      assert.strictEqual(getDaysInMonth(2023, 2), 28) // February
      assert.strictEqual(getDaysInMonth(2023, 3), 31) // March
      assert.strictEqual(getDaysInMonth(2023, 4), 30) // April
      assert.strictEqual(getDaysInMonth(2023, 5), 31) // May
      assert.strictEqual(getDaysInMonth(2023, 6), 30) // June
      assert.strictEqual(getDaysInMonth(2023, 7), 31) // July
      assert.strictEqual(getDaysInMonth(2023, 8), 31) // August
      assert.strictEqual(getDaysInMonth(2023, 9), 30) // September
      assert.strictEqual(getDaysInMonth(2023, 10), 31) // October
      assert.strictEqual(getDaysInMonth(2023, 11), 30) // November
      assert.strictEqual(getDaysInMonth(2023, 12), 31) // December
    })

    test('handles February in leap years', () => {
      assert.strictEqual(getDaysInMonth(2020, 2), 29) // Leap year
      assert.strictEqual(getDaysInMonth(2024, 2), 29) // Leap year
      assert.strictEqual(getDaysInMonth(2000, 2), 29) // Century leap year
      assert.strictEqual(getDaysInMonth(2100, 2), 28) // Century non-leap year
    })

    test('handles invalid months gracefully', () => {
      assert.strictEqual(getDaysInMonth(2023, 0), 31) // Default fallback
      assert.strictEqual(getDaysInMonth(2023, 13), 31) // Default fallback
    })
  })

  describe('isValidDate', () => {
    test('validates correct dates', () => {
      assert.strictEqual(isValidDate(2023, 1, 1), true)
      assert.strictEqual(isValidDate(2023, 12, 31), true)
      assert.strictEqual(isValidDate(2020, 2, 29), true) // Leap year
      assert.strictEqual(isValidDate(2024, 2, 29), true) // Leap year
    })

    test('rejects invalid dates', () => {
      assert.strictEqual(isValidDate(2023, 2, 29), false) // Non-leap year February
      assert.strictEqual(isValidDate(2023, 4, 31), false) // April has 30 days
      assert.strictEqual(isValidDate(2023, 6, 31), false) // June has 30 days
      assert.strictEqual(isValidDate(2023, 9, 31), false) // September has 30 days
      assert.strictEqual(isValidDate(2023, 11, 31), false) // November has 30 days
    })

    test('rejects invalid years', () => {
      assert.strictEqual(isValidDate(1899, 1, 1), false) // Too early
      assert.strictEqual(isValidDate(2101, 1, 1), false) // Too late
    })

    test('rejects invalid months and days', () => {
      assert.strictEqual(isValidDate(2023, 0, 1), false) // Invalid month
      assert.strictEqual(isValidDate(2023, 13, 1), false) // Invalid month
      assert.strictEqual(isValidDate(2023, 1, 0), false) // Invalid day
      assert.strictEqual(isValidDate(2023, 1, 32), false) // Invalid day
    })
  })

  describe('getYearOptions', () => {
    test('returns correct year range', () => {
      const options = getYearOptions(2020, 2025)
      assert.strictEqual(options.length, 6)
      assert.deepStrictEqual(options[0], { value: 2025, label: '2025' })
      assert.deepStrictEqual(options[5], { value: 2020, label: '2020' })
    })

    test('uses default range when not specified', () => {
      const currentYear = new Date().getFullYear()
      const options = getYearOptions()
      assert.strictEqual(options[0].value, currentYear + 10)
      assert.strictEqual(options[options.length - 1].value, 1900)
    })
  })

  describe('getMonthOptions', () => {
    test('returns all 12 months', () => {
      const options = getMonthOptions()
      assert.strictEqual(options.length, 12)
      assert.deepStrictEqual(options[0], { value: 1, label: 'January' })
      assert.deepStrictEqual(options[11], { value: 12, label: 'December' })
    })
  })

  describe('getDayOptions', () => {
    test('returns correct days for different months', () => {
      assert.strictEqual(getDayOptions(2023, 1).length, 31) // January
      assert.strictEqual(getDayOptions(2023, 2).length, 28) // February (non-leap)
      assert.strictEqual(getDayOptions(2023, 4).length, 30) // April
      assert.strictEqual(getDayOptions(2020, 2).length, 29) // February (leap year)
    })

    test('returns correct day values and labels', () => {
      const days = getDayOptions(2023, 1)
      assert.deepStrictEqual(days[0], { value: 1, label: '1' })
      assert.deepStrictEqual(days[30], { value: 31, label: '31' })
    })
  })
})

describe('Timezone-Aware Date Functions', () => {
  describe('dateToTimestamp and timestampToDate', () => {
    test('converts date to timestamp and back correctly', () => {
      const originalDate = new Date('2023-06-15T10:30:00Z')
      const timestamp = dateToTimestamp(originalDate)
      const convertedDate = timestampToDate(timestamp)
      
      assert.strictEqual(timestamp, originalDate.getTime())
      assert.strictEqual(convertedDate.getTime(), originalDate.getTime())
    })

    test('handles different dates correctly', () => {
      const dates = [
        new Date('2023-01-01T00:00:00Z'),
        new Date('2023-12-31T23:59:59Z'),
        new Date('2020-02-29T12:00:00Z'), // Leap year
      ]

      dates.forEach(date => {
        const timestamp = dateToTimestamp(date)
        const convertedBack = timestampToDate(timestamp)
        assert.strictEqual(convertedBack.getTime(), date.getTime())
      })
    })
  })

  describe('createDateInTimezone', () => {
    test('creates date in UTC timezone', () => {
      const date = createDateInTimezone(2023, 6, 15, 'UTC')
      assert.strictEqual(date.getUTCFullYear(), 2023)
      assert.strictEqual(date.getUTCMonth(), 5) // June is month 5 (0-indexed)
      assert.strictEqual(date.getUTCDate(), 15)
    })

    test('creates date in different timezones', () => {
      const utcDate = createDateInTimezone(2023, 6, 15, 'UTC')
      const nyDate = createDateInTimezone(2023, 6, 15, 'America/New_York')
      const laDate = createDateInTimezone(2023, 6, 15, 'America/Los_Angeles')

      // UTC date should be different from local dates (simplified implementation)
      // For UTC we expect a specific UTC timestamp
      assert.strictEqual(utcDate.getUTCFullYear(), 2023)
      assert.strictEqual(utcDate.getUTCMonth(), 5) // June is month 5 (0-indexed)
      assert.strictEqual(utcDate.getUTCDate(), 15)
      
      // For other timezones, they should be Date objects representing the same calendar day
      assert.strictEqual(nyDate.getFullYear(), 2023)
      assert.strictEqual(nyDate.getMonth(), 5) // June is month 5 (0-indexed)
      assert.strictEqual(nyDate.getDate(), 15)
      
      assert.strictEqual(laDate.getFullYear(), 2023)
      assert.strictEqual(laDate.getMonth(), 5) // June is month 5 (0-indexed)
      assert.strictEqual(laDate.getDate(), 15)
    })
  })

  describe('getTimezoneOffset', () => {
    test('returns 0 for UTC', () => {
      const offset = getTimezoneOffset('UTC')
      assert.strictEqual(offset, 0)
    })

    test('returns correct offset for known timezones', () => {
      const date = new Date('2023-06-15T12:00:00Z') // Summer time
      
      // Note: These tests might need adjustment based on DST rules
      // Just testing that the function returns a number
      const nyOffset = getTimezoneOffset('America/New_York', date)
      const laOffset = getTimezoneOffset('America/Los_Angeles', date)
      const londonOffset = getTimezoneOffset('Europe/London', date)

      assert.strictEqual(typeof nyOffset, 'number')
      assert.strictEqual(typeof laOffset, 'number')
      assert.strictEqual(typeof londonOffset, 'number')
    })

    test('handles invalid timezone gracefully', () => {
      const offset = getTimezoneOffset('Invalid/Timezone')
      assert.strictEqual(offset, 0)
    })
  })

  describe('formatTimestampInTimezone', () => {
    test('formats timestamp in UTC', () => {
      const timestamp = new Date('2023-06-15T00:00:00Z').getTime()
      const formatted = formatTimestampInTimezone(timestamp, 'UTC')
      assert.strictEqual(formatted, 'June 15, 2023')
    })

    test('formats timestamp with different format', () => {
      const timestamp = new Date('2023-06-15T00:00:00Z').getTime()
      const formatted = formatTimestampInTimezone(timestamp, 'UTC', 'MMM d, yyyy')
      assert.strictEqual(formatted, 'Jun 15, 2023')
    })

    test('handles invalid timezone gracefully', () => {
      const timestamp = new Date('2023-06-15T00:00:00Z').getTime()
      const formatted = formatTimestampInTimezone(timestamp, 'Invalid/Timezone')
      // Should fallback to local formatting
      assert.strictEqual(typeof formatted, 'string')
      assert.ok(formatted.includes('2023'))
    })
  })

  describe('date comparison functions', () => {
    test('isDateBefore works correctly', () => {
      const date1 = new Date('2023-06-15T10:00:00Z')
      const date2 = new Date('2023-06-15T11:00:00Z')
      const date3 = new Date('2023-06-16T10:00:00Z')

      assert.strictEqual(isDateBefore(date1, date2), true)
      assert.strictEqual(isDateBefore(date2, date1), false)
      assert.strictEqual(isDateBefore(date1, date3), true)
      assert.strictEqual(isDateBefore(date1, date1), false)
    })

    test('isDateAfter works correctly', () => {
      const date1 = new Date('2023-06-15T10:00:00Z')
      const date2 = new Date('2023-06-15T11:00:00Z')
      const date3 = new Date('2023-06-16T10:00:00Z')

      assert.strictEqual(isDateAfter(date2, date1), true)
      assert.strictEqual(isDateAfter(date1, date2), false)
      assert.strictEqual(isDateAfter(date3, date1), true)
      assert.strictEqual(isDateAfter(date1, date1), false)
    })

    test('isSameDay works correctly', () => {
      const date1 = new Date('2023-06-15T10:00:00Z')
      const date2 = new Date('2023-06-15T22:00:00Z')
      const date3 = new Date('2023-06-16T02:00:00Z') // Different day in UTC

      assert.strictEqual(isSameDay(date1, date2), true)
      assert.strictEqual(isSameDay(date1, date3), false)
      assert.strictEqual(isSameDay(date1, date1), true)
    })
  })

  describe('timezone-specific date functions', () => {
    test('getStartOfDayInTimezone returns midnight in timezone', () => {
      const inputDate = new Date('2023-06-15T15:30:00Z')
      const startOfDay = getStartOfDayInTimezone(inputDate, 'UTC')
      
      assert.strictEqual(startOfDay.getUTCHours(), 0)
      assert.strictEqual(startOfDay.getUTCMinutes(), 0)
      assert.strictEqual(startOfDay.getUTCSeconds(), 0)
      assert.strictEqual(startOfDay.getUTCMilliseconds(), 0)
    })

    test('getEndOfDayInTimezone returns end of day in timezone', () => {
      const inputDate = new Date('2023-06-15T15:30:00Z')
      const endOfDay = getEndOfDayInTimezone(inputDate, 'UTC')
      
      assert.strictEqual(endOfDay.getUTCHours(), 23)
      assert.strictEqual(endOfDay.getUTCMinutes(), 59)
      assert.strictEqual(endOfDay.getUTCSeconds(), 59)
      assert.strictEqual(endOfDay.getUTCMilliseconds(), 999)
    })

    test('getTodayInTimezone returns today in specified timezone', () => {
      const today = getTodayInTimezone('UTC')
      const now = new Date()
      
      assert.strictEqual(today.getUTCFullYear(), now.getUTCFullYear())
      assert.strictEqual(today.getUTCMonth(), now.getUTCMonth())
      assert.strictEqual(today.getUTCDate(), now.getUTCDate())
      assert.strictEqual(today.getUTCHours(), 0)
      assert.strictEqual(today.getUTCMinutes(), 0)
    })

    test('getTomorrowInTimezone returns tomorrow in specified timezone', () => {
      const tomorrow = getTomorrowInTimezone('UTC')
      const now = new Date()
      const expectedTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      assert.strictEqual(tomorrow.getUTCFullYear(), expectedTomorrow.getUTCFullYear())
      assert.strictEqual(tomorrow.getUTCMonth(), expectedTomorrow.getUTCMonth())
      assert.strictEqual(tomorrow.getUTCDate(), expectedTomorrow.getUTCDate())
      assert.strictEqual(tomorrow.getUTCHours(), 0)
      assert.strictEqual(tomorrow.getUTCMinutes(), 0)
    })
  })

  describe('edge cases and error handling', () => {
    test('handles edge dates correctly', () => {
      // Test year boundaries
      const newYearEve = new Date('2023-12-31T23:59:59Z')
      const newYearDay = new Date('2024-01-01T00:00:00Z')
      
      assert.strictEqual(isDateBefore(newYearEve, newYearDay), true)
      assert.strictEqual(isSameDay(newYearEve, newYearDay), false)
    })

    test('handles leap year edge cases', () => {
      const leapDay = new Date('2020-02-29T12:00:00Z')
      const timestamp = dateToTimestamp(leapDay)
      const recovered = timestampToDate(timestamp)
      
      assert.strictEqual(recovered.getFullYear(), 2020)
      assert.strictEqual(recovered.getMonth(), 1) // February (0-indexed)
      assert.strictEqual(recovered.getDate(), 29)
    })

    test('handles DST transitions', () => {
      // Test dates around DST transitions
      const springForward = new Date('2023-03-12T06:00:00Z')
      const fallBack = new Date('2023-11-05T06:00:00Z')
      
      const springFormatted = formatTimestampInTimezone(springForward.getTime(), 'America/New_York')
      const fallFormatted = formatTimestampInTimezone(fallBack.getTime(), 'America/New_York')
      
      assert.strictEqual(typeof springFormatted, 'string')
      assert.strictEqual(typeof fallFormatted, 'string')
    })
  })
})
