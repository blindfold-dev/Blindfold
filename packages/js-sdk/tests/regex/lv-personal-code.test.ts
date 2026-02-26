import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['lv'], entities: [EntityType.LV_PERSONAL_CODE] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Latvian Personal Code')

describe('Latvian Personal Code Detection', () => {
  test('should detect valid personal code with context', () => {
    const m = filterFn(scanner.detect('Personas kods: 321291-11674'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('321291-11674')
  })

  test('should reject invalid code', () => {
    expect(filterFn(scanner.detect('Personas kods: 010190-12345'))).toHaveLength(0)
  })
})
