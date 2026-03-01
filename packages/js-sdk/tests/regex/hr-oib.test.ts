import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['hr'], entities: [EntityType.HR_OIB] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Croatian OIB')

describe('Croatian OIB Detection', () => {
  test('should detect valid OIB with context', () => {
    const m = filterFn(scanner.detect('OIB: 69435151530'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('69435151530')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('OIB: 69435151531'))).toHaveLength(0)
  })
})
