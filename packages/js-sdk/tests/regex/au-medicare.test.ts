import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['au'], entities: [EntityType.AU_MEDICARE] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Australian Medicare')

describe('Australian Medicare Detection', () => {
  test('should detect valid Medicare number with context', () => {
    const m = filterFn(scanner.detect('Medicare: 2123 45670 1'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('2123 45670 1')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('Medicare: 2123 45679 1'))).toHaveLength(0)
  })
})
