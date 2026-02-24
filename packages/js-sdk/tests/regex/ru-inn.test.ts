import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ru'], entities: [EntityType.RU_INN] })
const ruInn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Russian INN')

describe('Russian INN Detection', () => {
  test('should detect valid 10-digit Russian INN with context', () => {
    const m = ruInn(scanner.detect('INN: 7707083893'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('7707083893')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(ruInn(scanner.detect('INN: 7707083890')).length).toBe(0)
  })

  test('should not match without context', () => {
    expect(ruInn(scanner.detect('7707083893')).length).toBe(0)
  })
})
