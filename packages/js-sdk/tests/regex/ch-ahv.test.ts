import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ch'], entities: [EntityType.CH_AHV] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Swiss AHV')

describe('Swiss AHV Detection', () => {
  test('should detect valid AHV', () => {
    const m = filterFn(scanner.detect('756.1234.5678.97'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('756.1234.5678.97')
  })

  test('should reject invalid EAN-13 check digit', () => {
    expect(filterFn(scanner.detect('756.1234.5678.96'))).toHaveLength(0)
  })
})
