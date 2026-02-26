import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['si'], entities: [EntityType.SI_TAX_NUMBER] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Slovenian Tax Number')

describe('Slovenian Tax Number Detection', () => {
  test('should detect valid tax number with context', () => {
    const m = filterFn(scanner.detect('Davcna stevilka: SI15012557'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('SI15012557')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('Davcna stevilka: SI15012558'))).toHaveLength(0)
  })
})
