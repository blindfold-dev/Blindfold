import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['de'], entities: [EntityType.DE_PERSONAL_ID] })
const dePersonalId = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'German Personal ID')

describe('German Personal ID Detection', () => {
  test('should detect valid German Personal ID with context', () => {
    const m = dePersonalId(scanner.detect('Personalausweis: T220001293'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('T220001293')
    expect(m[0].score).toBe(0.8)
  })

  test('should not match without context', () => {
    expect(dePersonalId(scanner.detect('T220001293')).length).toBe(0)
  })

  test('should reject invalid format', () => {
    expect(dePersonalId(scanner.detect('Personalausweis: 123456789')).length).toBe(0)
  })
})
