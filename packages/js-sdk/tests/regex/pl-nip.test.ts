import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['pl'], entities: [EntityType.PL_NIP] })
const plNip = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Polish NIP')

describe('Polish NIP Detection', () => {
  test('should detect valid Polish NIP with context', () => {
    const m = plNip(scanner.detect('NIP: 1234563218'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('1234563218')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(plNip(scanner.detect('NIP: 1234563219')).length).toBe(0)
  })

  test('should not match without context', () => {
    expect(plNip(scanner.detect('1234563218')).length).toBe(0)
  })
})
