import { PIIScanner } from '../../src/regex'

const MIXED_TEXT = 'SSN 123-45-6789 and IBAN DE89370400440532013000'

describe('Locale Filtering', () => {
  test('US locale detects SSN but not IBAN', () => {
    const scanner = new PIIScanner({ locales: ['us'] })
    const matches = scanner.detect(MIXED_TEXT)
    expect(matches.filter((m) => m.entityType === 'Social Security Number').length).toBe(1)
    expect(matches.filter((m) => m.entityType === 'IBAN').length).toBe(0)
  })

  test('EU locale detects IBAN but not SSN', () => {
    const scanner = new PIIScanner({ locales: ['eu'] })
    const matches = scanner.detect(MIXED_TEXT)
    expect(matches.filter((m) => m.entityType === 'IBAN').length).toBe(1)
    expect(matches.filter((m) => m.entityType === 'Social Security Number').length).toBe(0)
  })

  test('US+EU locale detects both', () => {
    const scanner = new PIIScanner({ locales: ['us', 'eu'] })
    const matches = scanner.detect(MIXED_TEXT)
    expect(matches.filter((m) => m.entityType === 'Social Security Number').length).toBe(1)
    expect(matches.filter((m) => m.entityType === 'IBAN').length).toBe(1)
  })

  test('UK locale detects NI Number', () => {
    const scanner = new PIIScanner({ locales: ['uk'] })
    const ni = scanner.detect('NI number: AB 12 34 56 A').filter((m) => m.entityType === 'NI Number')
    expect(ni.length).toBe(1)
  })

  test('UK locale does not detect SSN', () => {
    const scanner = new PIIScanner({ locales: ['uk'] })
    const ssn = scanner.detect('SSN 123-45-6789').filter((m) => m.entityType === 'Social Security Number')
    expect(ssn.length).toBe(0)
  })
})
