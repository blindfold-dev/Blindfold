import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['cz'], entities: [EntityType.CZ_BIRTH_NUMBER] })
const czBirthNumber = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Czech Birth Number')

describe('Czech Birth Number Detection', () => {
  test('should detect valid Czech Birth Number with context', () => {
    const m = czBirthNumber(scanner.detect('Rodne cislo: 7103192745'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('7103192745')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid Czech Birth Number with slash', () => {
    const m = czBirthNumber(scanner.detect('Rodne cislo: 710319/2745'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('710319/2745')
  })

  test('should reject number not divisible by 11', () => {
    expect(czBirthNumber(scanner.detect('Rodne cislo: 7103192746')).length).toBe(0)
  })

  test('should detect without context (strong validator)', () => {
    const m = czBirthNumber(scanner.detect('7103192745'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('7103192745')
  })
})
