import { PIIScanner } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['us', 'eu', 'uk'] })

describe('False Positives', () => {
  test('version number should not match as IP', () => {
    const ip = scanner.detect('version 1.2.3.4').filter((m) => m.entityType === 'IP Address')
    expect(ip.length).toBe(0)
  })

  test('v prefix should not match as IP', () => {
    const ip = scanner.detect('Running v1.2.3.4 of the app').filter((m) => m.entityType === 'IP Address')
    expect(ip.length).toBe(0)
  })

  test('year should not match', () => {
    expect(scanner.detect('The year 2024')).toEqual([])
  })

  test('quantity should not match', () => {
    expect(scanner.detect('I have 100 apples')).toEqual([])
  })

  test('time should not match', () => {
    expect(scanner.detect('My meeting is at 3:00')).toEqual([])
  })

  test('order number should not match as ZIP', () => {
    const zips = scanner.detect('Order #12345').filter((m) => m.entityType === 'ZIP Code')
    expect(zips.length).toBe(0)
  })

  test('normal sentence should not match', () => {
    expect(scanner.detect('The quick brown fox jumps over the lazy dog.')).toEqual([])
  })

  test('business text should not match', () => {
    expect(scanner.detect('Our quarterly revenue exceeded expectations.')).toEqual([])
  })
})
