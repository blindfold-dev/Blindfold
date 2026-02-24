import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['it'], entities: [EntityType.IT_CODICE_FISCALE] })
const itCodiceFiscale = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Italian Codice Fiscale')

describe('Italian Codice Fiscale Detection', () => {
  test('should detect valid Italian Codice Fiscale', () => {
    const m = itCodiceFiscale(scanner.detect('RSSMRA85T10A562S'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('RSSMRA85T10A562S')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid check character', () => {
    expect(itCodiceFiscale(scanner.detect('RSSMRA85T10A562A')).length).toBe(0)
  })
})
