import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ entities: [EntityType.EMAIL_ADDRESS] })
const emails = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Email Address')

describe('Email Detection', () => {
  test('should detect standard email', () => {
    const m = emails(scanner.detect('Email: user@example.com'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('user@example.com')
  })

  test('should detect email with dots', () => {
    expect(emails(scanner.detect('first.last@company.co.uk')).length).toBe(1)
  })

  test('should detect email with plus', () => {
    expect(emails(scanner.detect('user+tag@gmail.com')).length).toBe(1)
  })

  test('should not detect @nouser.com', () => {
    expect(emails(scanner.detect('@nouser.com')).length).toBe(0)
  })

  test('should not detect user@', () => {
    expect(emails(scanner.detect('user@')).length).toBe(0)
  })
})
