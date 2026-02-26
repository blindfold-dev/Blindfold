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

  test('should redact email with entity name placeholder', () => {
    const [redacted] = scanner.redact('Contact support@example.com for details.')
    expect(redacted).toContain('<Email Address>')
    expect(redacted).not.toContain('support@example.com')
  })

  test('should redact SSN with entity name placeholder', () => {
    const [redacted] = scanner.redact('SSN: 123-45-6789')
    expect(redacted).toContain('<Social Security Number>')
    expect(redacted).not.toContain('123-45-6789')
  })

  test('should redact multiple entities', () => {
    const [redacted, matches] = scanner.redact('Email john@acme.com, SSN 123-45-6789')
    expect(redacted).toContain('<Email Address>')
    expect(redacted).toContain('<Social Security Number>')
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  test('should return original text when no PII', () => {
    const text = 'This is a normal sentence.'
    const [redacted, matches] = scanner.redact(text)
    expect(redacted).toBe(text)
    expect(matches).toEqual([])
  })
})

describe('PIIScanner tokenize', () => {
  const scanner = new PIIScanner({ locales: ['us', 'eu'] })

  test('should tokenize email with numbered token', () => {
    const result = scanner.tokenize('Contact support@example.com for details.')
    expect(result.text).toContain('<Email Address_1>')
    expect(result.text).not.toContain('support@example.com')
    expect(result.mapping['<Email Address_1>']).toBe('support@example.com')
    expect(result.matches.length).toBe(1)
  })

  test('should tokenize multiple same-type entities with counters', () => {
    const result = scanner.tokenize('Email john@acme.com and jane@acme.com')
    expect(result.text).toContain('<Email Address_1>')
    expect(result.text).toContain('<Email Address_2>')
    expect(result.mapping['<Email Address_1>']).toBe('john@acme.com')
    expect(result.mapping['<Email Address_2>']).toBe('jane@acme.com')
  })

  test('should tokenize different entity types independently', () => {
    const result = scanner.tokenize('Email john@acme.com, SSN 123-45-6789')
    expect(result.text).toContain('<Email Address_1>')
    expect(result.text).toContain('<Social Security Number_1>')
    expect(Object.keys(result.mapping).length).toBeGreaterThanOrEqual(2)
  })

  test('should return original text when no PII', () => {
    const result = scanner.tokenize('This is normal text.')
    expect(result.text).toBe('This is normal text.')
    expect(result.mapping).toEqual({})
    expect(result.matches).toEqual([])
  })
})

describe('PIIScanner mask', () => {
  const scanner = new PIIScanner({ locales: ['us', 'eu'] })

  test('should mask email showing first 3 chars', () => {
    const result = scanner.mask('Contact support@example.com for details.')
    expect(result.text).not.toContain('support@example.com')
    // "sup" visible, rest masked
    expect(result.text).toContain('sup')
    expect(result.text).toContain('*')
    expect(result.matches.length).toBe(1)
  })

  test('should mask from end', () => {
    const result = scanner.mask('SSN: 123-45-6789', 4, true)
    expect(result.text).not.toContain('123-45-6789')
    // last 4 chars "6789" visible
    expect(result.text).toContain('6789')
  })

  test('should use custom masking char', () => {
    const result = scanner.mask('Contact support@example.com', 3, false, '#')
    expect(result.text).toContain('#')
    expect(result.text).not.toContain('*')
  })

  test('should return original text when no PII', () => {
    const result = scanner.mask('No PII here.')
    expect(result.text).toBe('No PII here.')
    expect(result.matches).toEqual([])
  })
})

describe('PIIScanner hash', () => {
  const scanner = new PIIScanner({ locales: ['us', 'eu'] })

  test('should hash email with default settings', () => {
    const result = scanner.hash('Contact support@example.com for details.')
    expect(result.text).not.toContain('support@example.com')
    expect(result.text).toContain('HASH_')
    expect(result.matches.length).toBe(1)
  })

  test('should produce deterministic hashes', () => {
    const r1 = scanner.hash('Email support@example.com')
    const r2 = scanner.hash('Email support@example.com')
    expect(r1.text).toBe(r2.text)
  })

  test('should use custom prefix and length', () => {
    const result = scanner.hash('Email support@example.com', 'sha256', 'H_', 8)
    expect(result.text).toContain('H_')
    // H_ + 8 hex chars = 10 chars total for the replacement
    const match = result.text.match(/H_[0-9a-f]{8}/)
    expect(match).not.toBeNull()
  })

  test('should return original text when no PII', () => {
    const result = scanner.hash('Normal text.')
    expect(result.text).toBe('Normal text.')
    expect(result.matches).toEqual([])
  })
})

describe('PIIScanner synthesize', () => {
  const scanner = new PIIScanner({ locales: ['us', 'eu'] })

  test('should replace email with synthetic value', () => {
    const result = scanner.synthesize('Contact support@example.com for details.')
    expect(result.text).not.toContain('support@example.com')
    expect(result.text).toContain('@')
    expect(result.matches.length).toBe(1)
  })

  test('should replace SSN with format-preserving value', () => {
    const result = scanner.synthesize('SSN: 123-45-6789')
    expect(result.text).not.toContain('123-45-6789')
    // Should preserve separator pattern: ###-##-####
    expect(result.text).toMatch(/SSN: \d{3}-\d{2}-\d{4}/)
    expect(result.matches.length).toBe(1)
  })

  test('should produce different results on multiple calls', () => {
    const results = new Set<string>()
    for (let i = 0; i < 5; i++) {
      results.add(scanner.synthesize('Email john@acme.com').text)
    }
    expect(results.size).toBeGreaterThan(1)
  })

  test('should return original text when no PII', () => {
    const result = scanner.synthesize('No sensitive data here.')
    expect(result.text).toBe('No sensitive data here.')
    expect(result.matches).toEqual([])
  })

  test('should replace IP address with valid-looking IP', () => {
    const result = scanner.synthesize('Server at 192.168.1.100')
    expect(result.text).not.toContain('192.168.1.100')
    expect(result.text).toMatch(/Server at \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)
  })
})

describe('PIIScanner encrypt', () => {
  const scanner = new PIIScanner({ locales: ['us', 'eu'] })
  const key = 'my-secret-key-1234567890'

  test('should encrypt email', () => {
    const result = scanner.encrypt('Contact support@example.com for details.', key)
    expect(result.text).not.toContain('support@example.com')
    expect(result.matches.length).toBe(1)
    // Encrypted output should be base64
    const encrypted = result.text.replace('Contact ', '').replace(' for details.', '')
    expect(() => Buffer.from(encrypted, 'base64')).not.toThrow()
  })

  test('should produce different ciphertext each call (random IV)', () => {
    const r1 = scanner.encrypt('Email support@example.com', key)
    const r2 = scanner.encrypt('Email support@example.com', key)
    expect(r1.text).not.toBe(r2.text)
  })

  test('should throw on short key', () => {
    expect(() => scanner.encrypt('Email support@example.com', 'short')).toThrow()
  })

  test('should return original text when no PII', () => {
    const result = scanner.encrypt('Normal text.', key)
    expect(result.text).toBe('Normal text.')
    expect(result.matches).toEqual([])
  })
})
