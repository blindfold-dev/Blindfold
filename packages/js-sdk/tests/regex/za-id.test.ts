import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['za'], entities: [EntityType.ZA_ID] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'South African ID')

describe('South African ID Detection', () => {
  test('should detect valid SA ID with context', () => {
    const m = filterFn(scanner.detect('SA ID: 8001015009087'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('8001015009087')
  })

  test('should reject invalid Luhn checksum', () => {
    expect(filterFn(scanner.detect('SA ID: 8001015009088'))).toHaveLength(0)
  })
})
