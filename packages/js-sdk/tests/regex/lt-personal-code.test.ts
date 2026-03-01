import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['lt'], entities: [EntityType.LT_PERSONAL_CODE] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Lithuanian Personal Code')

describe('Lithuanian Personal Code Detection', () => {
  test('should detect valid personal code with context', () => {
    const m = filterFn(scanner.detect('Asmens kodas: 38903110814'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('38903110814')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('Asmens kodas: 38903110817'))).toHaveLength(0)
  })
})
