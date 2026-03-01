import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['us', 'eu'] })

describe('Context Scoring', () => {
  test('SSN with context scores 1.0', () => {
    const matches = scanner.detect('My SSN is 123-45-6789.')
    const ssns = matches.filter((m) => m.entityType === 'Social Security Number')
    expect(ssns.length).toBe(1)
    expect(ssns[0].score).toBe(1.0)
  })

  test('SSN without context scores below 1.0', () => {
    const matches = scanner.detect('Reference: 123-45-6789.')
    const ssns = matches.filter((m) => m.entityType === 'Social Security Number')
    expect(ssns.length).toBe(1)
    expect(ssns[0].score).toBeLessThan(1.0)
  })

  test('ZIP with context scores 1.0', () => {
    const matches = scanner.detect('Shipping address, zip code 90210.')
    const zips = matches.filter((m) => m.entityType === 'ZIP Code')
    expect(zips.length).toBe(1)
    expect(zips[0].score).toBe(1.0)
  })

  test('DOB with context scores 1.0', () => {
    const matches = scanner.detect('Date of birth: 03/15/1990.')
    const dobs = matches.filter((m) => m.entityType === 'Date of Birth')
    expect(dobs.length).toBeGreaterThanOrEqual(1)
    expect(dobs[0].score).toBe(1.0)
  })
})

describe('Bidirectional Context', () => {
  test('SSN context after match', () => {
    const matches = scanner.detect('ID 123-45-6789 is a social security number.')
    const ssns = matches.filter((m) => m.entityType === 'Social Security Number')
    expect(ssns.length).toBe(1)
    expect(ssns[0].score).toBe(1.0)
  })

  test('SSN no-separator context after match', () => {
    const matches = scanner.detect('Number 123456789 is the ssn on file.')
    const ssns = matches.filter((m) => m.entityType === 'Social Security Number')
    expect(ssns.length).toBe(1)
    expect(ssns[0].score).toBe(1.0)
  })

  test('DOB context after match', () => {
    const matches = scanner.detect('03/15/1990 is the date of birth on record.')
    const dobs = matches.filter((m) => m.entityType === 'Date of Birth')
    expect(dobs.length).toBeGreaterThanOrEqual(1)
    expect(dobs[0].score).toBe(1.0)
  })

  test('ZIP context after match', () => {
    const matches = scanner.detect('90210 is the zip code.')
    const zips = matches.filter((m) => m.entityType === 'ZIP Code')
    expect(zips.length).toBe(1)
    expect(zips[0].score).toBe(1.0)
  })
})

describe('Phone Context Scoring', () => {
  test('phone with context scores 1.0', () => {
    const matches = scanner.detect('Call me at (212) 555-1234 today.')
    const phones = matches.filter((m) => m.entityType === 'Phone Number')
    expect(phones.length).toBe(1)
    expect(phones[0].score).toBe(1.0)
  })

  test('phone with tel context', () => {
    const matches = scanner.detect('Tel: +1-212-555-1234')
    const phones = matches.filter((m) => m.entityType === 'Phone Number')
    expect(phones.length).toBe(1)
    expect(phones[0].score).toBe(1.0)
  })

  test('phone without context scores below 1.0', () => {
    const matches = scanner.detect('(212) 555-1234')
    const phones = matches.filter((m) => m.entityType === 'Phone Number')
    expect(phones.length).toBe(1)
    expect(phones[0].score).toBeLessThan(1.0)
  })
})

describe('Backward Compatibility', () => {
  test('email score unchanged', () => {
    const matches = scanner.detect('user@example.com')
    const emails = matches.filter((m) => m.entityType === 'Email Address')
    expect(emails.length).toBe(1)
    expect(emails[0].score).toBe(0.95)
  })

  test('MAC address score unchanged', () => {
    const matches = scanner.detect('MAC: 00:1A:2B:3C:4D:5E')
    const macs = matches.filter((m) => m.entityType === 'MAC Address')
    expect(macs.length).toBe(1)
    expect(macs[0].score).toBe(0.95)
  })
})
