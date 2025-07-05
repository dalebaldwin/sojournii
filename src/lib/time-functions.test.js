import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { convertTo12Hour, convertTo24Hour } from './time-functions.js'

describe('convertTo24Hour', () => {
  test('should convert 12 AM to 0', () => {
    assert.equal(convertTo24Hour(12, 'AM'), 0)
  })
  test('should convert 1 AM to 1', () => {
    assert.equal(convertTo24Hour(1, 'AM'), 1)
  })
  test('should convert 6 AM to 6', () => {
    assert.equal(convertTo24Hour(6, 'AM'), 6)
  })
  test('should convert 11 AM to 11', () => {
    assert.equal(convertTo24Hour(11, 'AM'), 11)
  })
  test('should convert 12 PM to 12', () => {
    assert.equal(convertTo24Hour(12, 'PM'), 12)
  })
  test('should convert 1 PM to 13', () => {
    assert.equal(convertTo24Hour(1, 'PM'), 13)
  })
  test('should convert 6 PM to 18', () => {
    assert.equal(convertTo24Hour(6, 'PM'), 18)
  })
  test('should convert 11 PM to 23', () => {
    assert.equal(convertTo24Hour(11, 'PM'), 23)
  })
})

describe('convertTo12Hour', () => {
  test('should convert 0 to 12 AM', () => {
    assert.deepEqual(convertTo12Hour(0), { hour: 12, amPm: 'AM' })
  })
  test('should convert 1 to 1 AM', () => {
    assert.deepEqual(convertTo12Hour(1), { hour: 1, amPm: 'AM' })
  })
  test('should convert 6 to 6 AM', () => {
    assert.deepEqual(convertTo12Hour(6), { hour: 6, amPm: 'AM' })
  })
  test('should convert 11 to 11 AM', () => {
    assert.deepEqual(convertTo12Hour(11), { hour: 11, amPm: 'AM' })
  })
  test('should convert 12 to 12 PM', () => {
    assert.deepEqual(convertTo12Hour(12), { hour: 12, amPm: 'PM' })
  })
  test('should convert 13 to 1 PM', () => {
    assert.deepEqual(convertTo12Hour(13), { hour: 1, amPm: 'PM' })
  })
  test('should convert 18 to 6 PM', () => {
    assert.deepEqual(convertTo12Hour(18), { hour: 6, amPm: 'PM' })
  })
  test('should convert 23 to 11 PM', () => {
    assert.deepEqual(convertTo12Hour(23), { hour: 11, amPm: 'PM' })
  })
})

describe('round-trip conversions', () => {
  test('should convert 12-hour to 24-hour and back correctly', () => {
    const original = { hour: 3, amPm: 'PM' }
    const hour24 = convertTo24Hour(original.hour, original.amPm)
    const result = convertTo12Hour(hour24)
    assert.deepEqual(result, original)
  })
  test('should handle edge case of 12 AM', () => {
    const original = { hour: 12, amPm: 'AM' }
    const hour24 = convertTo24Hour(original.hour, original.amPm)
    const result = convertTo12Hour(hour24)
    assert.deepEqual(result, original)
  })
  test('should handle edge case of 12 PM', () => {
    const original = { hour: 12, amPm: 'PM' }
    const hour24 = convertTo24Hour(original.hour, original.amPm)
    const result = convertTo12Hour(hour24)
    assert.deepEqual(result, original)
  })
})
