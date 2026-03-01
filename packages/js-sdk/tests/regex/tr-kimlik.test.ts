import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['tr'], entities: [EntityType.TR_KIMLIK] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Turkish Kimlik')

describe('Turkish Kimlik Detection', () => {
  test('should detect valid Kimlik with context', () => {
    const m = filterFn(scanner.detect('TC Kimlik: 10000000146'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('10000000146')
  })

  test('should reject invalid check digits', () => {
    expect(filterFn(scanner.detect('TC Kimlik: 10000000147'))).toHaveLength(0)
  })
})
