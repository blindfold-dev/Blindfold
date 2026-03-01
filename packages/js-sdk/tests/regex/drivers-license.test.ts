import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['us'], entities: [EntityType.DRIVERS_LICENSE] })
const dl = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === "Driver's License")

describe("Driver's License Detection", () => {
  // Existing formats
  test('CA format (1L+7D)', () => {
    expect(dl(scanner.detect("driver's license: A1234567")).length).toBe(1)
  })

  test('NY format (9D)', () => {
    expect(dl(scanner.detect('DL# 123456789')).length).toBe(1)
  })

  test('TX format (8D)', () => {
    expect(dl(scanner.detect('license: 12345678')).length).toBe(1)
  })

  test('FL format (1L+12D)', () => {
    expect(dl(scanner.detect('DL A123456789012')).length).toBe(1)
  })

  test('IL format (1L+11D)', () => {
    expect(dl(scanner.detect('license A12345678901')).length).toBe(1)
  })

  // New formats
  test('NJ format (1L+14D)', () => {
    expect(dl(scanner.detect("driver's license: A12345678901234")).length).toBe(1)
  })

  test('WI format (1L+13D)', () => {
    expect(dl(scanner.detect('DL A1234567890123')).length).toBe(1)
  })

  test('MI format (1L+10D)', () => {
    expect(dl(scanner.detect('license: A1234567890')).length).toBe(1)
  })

  test('MA/VA format (1L+8D)', () => {
    expect(dl(scanner.detect('DL# A12345678')).length).toBe(1)
  })

  test('OH format (2L+6D)', () => {
    expect(dl(scanner.detect('license: AB123456')).length).toBe(1)
  })

  // Context required
  test('no context no match', () => {
    expect(dl(scanner.detect('Reference A1234567')).length).toBe(0)
  })

  test('DMV keyword works', () => {
    expect(dl(scanner.detect('DMV number: A1234567')).length).toBe(1)
  })
})
