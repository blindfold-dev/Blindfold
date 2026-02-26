import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['cl'], entities: [EntityType.CL_RUT] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Chilean RUT')

describe('Chilean RUT Detection', () => {
  test('should detect valid RUT with context', () => {
    const m = filterFn(scanner.detect('RUT: 12.345.678-5'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('12.345.678-5')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('RUT: 12.345.678-6'))).toHaveLength(0)
  })
})
