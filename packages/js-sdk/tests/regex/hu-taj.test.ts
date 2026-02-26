import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['hu'], entities: [EntityType.HU_TAJ] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Hungarian TAJ')

describe('Hungarian TAJ Detection', () => {
  test('should detect valid TAJ with context', () => {
    const m = filterFn(scanner.detect('TAJ: 123 456 788'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('123 456 788')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('TAJ: 123 456 789'))).toHaveLength(0)
  })
})
