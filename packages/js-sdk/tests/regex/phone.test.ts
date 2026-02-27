import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ entities: [EntityType.PHONE_NUMBER] })
const phone = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Phone Number')

describe('Phone Number Detection', () => {
  // NANP formats
  test('NANP with dashes', () => {
    expect(phone(scanner.detect('Call 555-867-5309')).length).toBe(1)
  })

  test('NANP with dots', () => {
    expect(phone(scanner.detect('Call 555.867.5309')).length).toBe(1)
  })

  test('NANP with parens', () => {
    expect(phone(scanner.detect('Call (555) 867-5309')).length).toBe(1)
  })

  test('NANP parens no separator', () => {
    expect(phone(scanner.detect('Call (555)867-5309')).length).toBe(1)
  })

  test('NANP parens fully compact', () => {
    expect(phone(scanner.detect('Call (555)8675309')).length).toBe(1)
  })

  test('NANP +1 prefix', () => {
    expect(phone(scanner.detect('Call +1 555-867-5309')).length).toBe(1)
  })

  test('NANP +1 no space', () => {
    expect(phone(scanner.detect('Call +1555-867-5309')).length).toBe(1)
  })

  // International formats
  test('UK with separators', () => {
    expect(phone(scanner.detect('Call +44 7700 428594')).length).toBe(1)
  })

  test('UK no separator after CC', () => {
    expect(phone(scanner.detect('Call +447700428594')).length).toBe(1)
  })

  test('DE international', () => {
    expect(phone(scanner.detect('Call +49 30 12345678')).length).toBe(1)
  })

  test('FR international', () => {
    expect(phone(scanner.detect('Call +33 1 23 45 67 89')).length).toBe(1)
  })

  // EU trunk prefix
  test('French local number', () => {
    expect(phone(scanner.detect('Call 02.37.15.52.25')).length).toBe(1)
  })

  test('Belgian local number', () => {
    expect(phone(scanner.detect('Call 0488 71 46 12')).length).toBe(1)
  })

  test('Dutch local number', () => {
    expect(phone(scanner.detect('Call 0650 241 46 10')).length).toBe(1)
  })

  // Extensions
  test('NANP with x extension', () => {
    const matches = phone(scanner.detect('Call (654)865-6539x373'))
    expect(matches.length).toBe(1)
    expect(matches[0].text).toContain('x373')
  })

  test('NANP with ext extension', () => {
    const matches = phone(scanner.detect('Call 555-867-5309 ext.456'))
    expect(matches.length).toBe(1)
    expect(matches[0].text).toContain('ext.456')
  })

  // Negatives
  test('short number not detected', () => {
    expect(phone(scanner.detect('Reference: 12345')).length).toBe(0)
  })

  test('year not detected as phone', () => {
    expect(phone(scanner.detect('The year 2024')).length).toBe(0)
  })

  test('price not detected as phone', () => {
    expect(phone(scanner.detect('Total: $1,234.56')).length).toBe(0)
  })
})
