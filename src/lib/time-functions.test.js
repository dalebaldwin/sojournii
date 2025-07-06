import assert from 'node:assert'
import { describe, test } from 'node:test'
import {
  convertTo12Hour,
  convertTo24Hour,
  getDayOptions,
  getDaysInMonth,
  getMonthOptions,
  getYearOptions,
  isLeapYear,
  isValidDate,
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
