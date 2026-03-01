import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ar'], entities: [EntityType.AR_CUIT] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Argentine CUIT')

describe('Argentine CUIT Detection', () => {
  test('should detect valid CUIT with context', () => {
    const m = filterFn(scanner.detect('CUIT: 20-12345678-6'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('20-12345678-6')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('CUIT: 20-12345678-4'))).toHaveLength(0)
  })
})
