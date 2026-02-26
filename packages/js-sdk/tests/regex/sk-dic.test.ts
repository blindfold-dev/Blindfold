import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['sk'], entities: [EntityType.SK_DIC] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Slovak DIC')

describe('Slovak DIC Detection', () => {
  test('should detect valid DIC', () => {
    const m = filterFn(scanner.detect('DIC: SK2020317068'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('SK2020317068')
  })

  test('should reject number not divisible by 11', () => {
    expect(filterFn(scanner.detect('SK2020317069'))).toHaveLength(0)
  })
})
