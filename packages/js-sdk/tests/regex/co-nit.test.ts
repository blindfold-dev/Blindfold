import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['co'], entities: [EntityType.CO_NIT] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Colombian NIT')

describe('Colombian NIT Detection', () => {
  test('should detect valid NIT with context', () => {
    const m = filterFn(scanner.detect('NIT: 900.123.456-8'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('900.123.456-8')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('NIT: 900.123.456-2'))).toHaveLength(0)
  })
})
