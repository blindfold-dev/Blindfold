import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ca'], entities: [EntityType.CA_SIN] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Canadian SIN')

describe('Canadian SIN Detection', () => {
  test('should detect valid SIN with context', () => {
    const m = filterFn(scanner.detect('SIN: 046 454 286'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('046 454 286')
  })

  test('should reject invalid Luhn checksum', () => {
    expect(filterFn(scanner.detect('SIN: 046 454 287'))).toHaveLength(0)
  })
})
