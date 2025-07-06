import { describe, test } from 'node:test'
import {
  convertTo24Hour,
  convertTo12Hour,
  isLeapYear,
  getDaysInMonth,
  isValidDate,
  getYearOptions,
  getMonthOptions,
  getDayOptions,
} from './time-functions'

describe('Time Conversion Functions', () => {
  describe('convertTo24Hour', () => {
    test('converts AM hours correctly', () => {
      expect(convertTo24Hour(1, 'AM')).toBe(1)
      expect(convertTo24Hour(12, 'AM')).toBe(0)
      expect(convertTo24Hour(11, 'AM')).toBe(11)
    })

    test('converts PM hours correctly', () => {
      expect(convertTo24Hour(1, 'PM')).toBe(13)
      expect(convertTo24Hour(12, 'PM')).toBe(12)
      expect(convertTo24Hour(11, 'PM')).toBe(23)
    })
  })

  describe('convertTo12Hour', () => {
    test('converts 24-hour to 12-hour correctly', () => {
      expect(convertTo12Hour(0)).toEqual({ hour: 12, amPm: 'AM' })
      expect(convertTo12Hour(12)).toEqual({ hour: 12, amPm: 'PM' })
      expect(convertTo12Hour(1)).toEqual({ hour: 1, amPm: 'AM' })
      expect(convertTo12Hour(13)).toEqual({ hour: 1, amPm: 'PM' })
      expect(convertTo12Hour(23)).toEqual({ hour: 11, amPm: 'PM' })
    })
  })
})

describe('Date Utility Functions', () => {
  describe('isLeapYear', () => {
    test('identifies leap years correctly', () => {
      expect(isLeapYear(2000)).toBe(true) // Century leap year
      expect(isLeapYear(2020)).toBe(true) // Regular leap year
      expect(isLeapYear(2024)).toBe(true) // Regular leap year
      expect(isLeapYear(2100)).toBe(false) // Century non-leap year
      expect(isLeapYear(2023)).toBe(false) // Non-leap year
      expect(isLeapYear(1900)).toBe(false) // Century non-leap year
    })
  })

  describe('getDaysInMonth', () => {
    test('returns correct days for each month', () => {
      // Non-leap year
      expect(getDaysInMonth(2023, 1)).toBe(31) // January
      expect(getDaysInMonth(2023, 2)).toBe(28) // February
      expect(getDaysInMonth(2023, 3)).toBe(31) // March
      expect(getDaysInMonth(2023, 4)).toBe(30) // April
      expect(getDaysInMonth(2023, 5)).toBe(31) // May
      expect(getDaysInMonth(2023, 6)).toBe(30) // June
      expect(getDaysInMonth(2023, 7)).toBe(31) // July
      expect(getDaysInMonth(2023, 8)).toBe(31) // August
      expect(getDaysInMonth(2023, 9)).toBe(30) // September
      expect(getDaysInMonth(2023, 10)).toBe(31) // October
      expect(getDaysInMonth(2023, 11)).toBe(30) // November
      expect(getDaysInMonth(2023, 12)).toBe(31) // December
    })

    test('handles February in leap years', () => {
      expect(getDaysInMonth(2020, 2)).toBe(29) // Leap year
      expect(getDaysInMonth(2024, 2)).toBe(29) // Leap year
      expect(getDaysInMonth(2000, 2)).toBe(29) // Century leap year
      expect(getDaysInMonth(2100, 2)).toBe(28) // Century non-leap year
    })

    test('handles invalid months gracefully', () => {
      expect(getDaysInMonth(2023, 0)).toBe(31) // Default fallback
      expect(getDaysInMonth(2023, 13)).toBe(31) // Default fallback
    })
  })

  describe('isValidDate', () => {
    test('validates correct dates', () => {
      expect(isValidDate(2023, 1, 1)).toBe(true)
      expect(isValidDate(2023, 12, 31)).toBe(true)
      expect(isValidDate(2020, 2, 29)).toBe(true) // Leap year
      expect(isValidDate(2024, 2, 29)).toBe(true) // Leap year
    })

    test('rejects invalid dates', () => {
      expect(isValidDate(2023, 2, 29)).toBe(false) // Non-leap year February
      expect(isValidDate(2023, 4, 31)).toBe(false) // April has 30 days
      expect(isValidDate(2023, 6, 31)).toBe(false) // June has 30 days
      expect(isValidDate(2023, 9, 31)).toBe(false) // September has 30 days
      expect(isValidDate(2023, 11, 31)).toBe(false) // November has 30 days
    })

    test('rejects invalid years', () => {
      expect(isValidDate(1899, 1, 1)).toBe(false) // Too early
      expect(isValidDate(2101, 1, 1)).toBe(false) // Too late
    })

    test('rejects invalid months and days', () => {
      expect(isValidDate(2023, 0, 1)).toBe(false) // Invalid month
      expect(isValidDate(2023, 13, 1)).toBe(false) // Invalid month
      expect(isValidDate(2023, 1, 0)).toBe(false) // Invalid day
      expect(isValidDate(2023, 1, 32)).toBe(false) // Invalid day
    })
  })

  describe('getYearOptions', () => {
    test('returns correct year range', () => {
      const options = getYearOptions(2020, 2025)
      expect(options).toHaveLength(6)
      expect(options[0]).toEqual({ value: 2025, label: '2025' })
      expect(options[5]).toEqual({ value: 2020, label: '2020' })
    })

    test('uses default range when not specified', () => {
      const currentYear = new Date().getFullYear()
      const options = getYearOptions()
      expect(options[0].value).toBe(currentYear + 10)
      expect(options[options.length - 1].value).toBe(1900)
    })
  })

  describe('getMonthOptions', () => {
    test('returns all 12 months', () => {
      const options = getMonthOptions()
      expect(options).toHaveLength(12)
      expect(options[0]).toEqual({ value: 1, label: 'January' })
      expect(options[11]).toEqual({ value: 12, label: 'December' })
    })
  })

  describe('getDayOptions', () => {
    test('returns correct days for different months', () => {
      expect(getDayOptions(2023, 1)).toHaveLength(31) // January
      expect(getDayOptions(2023, 2)).toHaveLength(28) // February (non-leap)
      expect(getDayOptions(2023, 4)).toHaveLength(30) // April
      expect(getDayOptions(2020, 2)).toHaveLength(29) // February (leap year)
    })

    test('returns correct day values and labels', () => {
      const days = getDayOptions(2023, 1)
      expect(days[0]).toEqual({ value: 1, label: '1' })
      expect(days[30]).toEqual({ value: 31, label: '31' })
    })
  })
})
