import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['bg'], entities: [EntityType.BG_EGN] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Bulgarian EGN')

describe('Bulgarian EGN Detection', () => {
  test('should detect valid EGN with context', () => {
    const m = filterFn(scanner.detect('EGN: 7523169263'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('7523169263')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('EGN: 7523169264'))).toHaveLength(0)
  })
})
