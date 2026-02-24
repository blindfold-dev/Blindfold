import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ru'], entities: [EntityType.RU_SNILS] })
const ruSnils = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Russian SNILS')

describe('Russian SNILS Detection', () => {
  test('should detect valid Russian SNILS with context', () => {
    const m = ruSnils(scanner.detect('SNILS: 112-233-445 95'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('112-233-445 95')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(ruSnils(scanner.detect('SNILS: 112-233-445 99')).length).toBe(0)
  })

  test('should not match without context', () => {
    expect(ruSnils(scanner.detect('112-233-445 95')).length).toBe(0)
  })
})
