import { PIIScanner } from '../../src/regex'

describe('PIIScanner detect', () => {
  const scanner = new PIIScanner({ locales: ['us', 'eu'] })

  test('should detect email in text', () => {
    const matches = scanner.detect('Contact us at support@example.com for help.')
    const emails = matches.filter((m) => m.entityType === 'Email Address')
    expect(emails.length).toBe(1)
    expect(emails[0].text).toBe('support@example.com')
  })

  test('should detect SSN in text', () => {
    const matches = scanner.detect('My SSN is 123-45-6789.')
    const ssns = matches.filter((m) => m.entityType === 'Social Security Number')
    expect(ssns.length).toBe(1)
    expect(ssns[0].text).toBe('123-45-6789')
  })

  test('should detect multiple entity types', () => {
    const matches = scanner.detect('Email john@acme.com, SSN 123-45-6789')
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Email Address')).toBe(true)
    expect(types.has('Social Security Number')).toBe(true)
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  test('should return empty for no PII', () => {
    expect(scanner.detect('')).toEqual([])
    expect(scanner.detect('Just a regular sentence.')).toEqual([])
  })

  test('should return correct start/end positions', () => {
    const text = 'Email: user@example.com is valid'
    const matches = scanner.detect(text)
    const emails = matches.filter((m) => m.entityType === 'Email Address')
    expect(emails.length).toBe(1)
    expect(text.slice(emails[0].start, emails[0].end)).toBe('user@example.com')
  })
})

describe('PIIScanner redact', () => {
  const scanner = new PIIScanner({ locales: ['us', 'eu'] })

  test('should redact email with label', () => {
    const [redacted] = scanner.redact('Contact support@example.com for details.')
    expect(redacted).toContain('[EMAIL_ADDRESS]')
    expect(redacted).not.toContain('support@example.com')
  })

  test('should redact SSN with label', () => {
    const [redacted] = scanner.redact('SSN: 123-45-6789')
    expect(redacted).toContain('[SSN]')
    expect(redacted).not.toContain('123-45-6789')
  })

  test('should redact multiple entities', () => {
    const [redacted, matches] = scanner.redact('Email john@acme.com, SSN 123-45-6789')
    expect(redacted).toContain('[EMAIL_ADDRESS]')
    expect(redacted).toContain('[SSN]')
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  test('should return original text when no PII', () => {
    const text = 'This is a normal sentence.'
    const [redacted, matches] = scanner.redact(text)
    expect(redacted).toBe(text)
    expect(matches).toEqual([])
  })
})
