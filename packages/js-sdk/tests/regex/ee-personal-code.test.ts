import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ee'], entities: [EntityType.EE_PERSONAL_CODE] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Estonian Personal Code')

describe('Estonian Personal Code Detection', () => {
  test('should detect valid personal code with context', () => {
    const m = filterFn(scanner.detect('Isikukood: 37605030299'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('37605030299')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('Isikukood: 37605030290'))).toHaveLength(0)
  })
})
