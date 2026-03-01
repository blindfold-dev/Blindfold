import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['sk'], entities: [EntityType.SK_ICO] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Slovak ICO')

describe('Slovak ICO Detection', () => {
  test('should detect valid ICO with context', () => {
    const m = filterFn(scanner.detect('ICO: 31322832'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('31322832')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('ICO: 31322833'))).toHaveLength(0)
  })
})
