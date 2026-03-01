import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['fi'], entities: [EntityType.FI_YTUNNUS] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Finnish Y-tunnus')

describe('Finnish Y-tunnus Detection', () => {
  test('should detect valid Y-tunnus with context', () => {
    const m = filterFn(scanner.detect('Y-tunnus: 2077474-0'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('2077474-0')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('Y-tunnus: 2077474-1'))).toHaveLength(0)
  })
})
