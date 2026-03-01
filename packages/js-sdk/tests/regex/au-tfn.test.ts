import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['au'], entities: [EntityType.AU_TFN] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Australian TFN')

describe('Australian TFN Detection', () => {
  test('should detect valid TFN with context', () => {
    const m = filterFn(scanner.detect('TFN: 123 456 782'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('123 456 782')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('TFN: 123 456 783'))).toHaveLength(0)
  })
})
