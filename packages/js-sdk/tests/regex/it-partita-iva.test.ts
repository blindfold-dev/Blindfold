import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['it'], entities: [EntityType.IT_PARTITA_IVA] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Italian Partita IVA')

describe('Italian Partita IVA Detection', () => {
  test('should detect valid Partita IVA with context', () => {
    const m = filterFn(scanner.detect('Partita IVA: 12345678903'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('12345678903')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('Partita IVA: 12345678900'))).toHaveLength(0)
  })
})
