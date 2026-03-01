import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['pl'], entities: [EntityType.PL_REGON] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Polish REGON')

describe('Polish REGON Detection', () => {
  test('should detect valid REGON with context', () => {
    const m = filterFn(scanner.detect('REGON: 123456785'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('123456785')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('REGON: 123456780'))).toHaveLength(0)
  })
})
