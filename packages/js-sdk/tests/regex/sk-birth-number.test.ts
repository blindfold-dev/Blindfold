import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['sk'], entities: [EntityType.SK_BIRTH_NUMBER] })
const skBirthNumber = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Slovak Birth Number')

describe('Slovak Birth Number Detection', () => {
  test('should detect valid Slovak Birth Number with context', () => {
    const m = skBirthNumber(scanner.detect('Rodne cislo: 7103192745'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('7103192745')
    expect(m[0].score).toBe(1.0)
  })

  test('should not match without context', () => {
    expect(skBirthNumber(scanner.detect('7103192745')).length).toBe(0)
  })
})
