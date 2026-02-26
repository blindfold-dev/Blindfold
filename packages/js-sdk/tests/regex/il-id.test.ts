import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['il'], entities: [EntityType.IL_ID] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Israeli ID')

describe('Israeli ID Detection', () => {
  test('should detect valid Israeli ID with context', () => {
    const m = filterFn(scanner.detect('Teudat Zehut: 031456783'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('031456783')
  })

  test('should reject invalid Luhn checksum', () => {
    expect(filterFn(scanner.detect('Teudat Zehut: 031456784'))).toHaveLength(0)
  })
})
