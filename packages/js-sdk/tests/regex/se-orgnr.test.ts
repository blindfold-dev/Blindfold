import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['se'], entities: [EntityType.SE_ORGNR] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Swedish Organisationsnummer')

describe('Swedish Organisationsnummer Detection', () => {
  test('should detect valid organisationsnummer with context', () => {
    const m = filterFn(scanner.detect('Organisationsnummer: 5567037485'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('5567037485')
  })

  test('should reject invalid Luhn checksum', () => {
    expect(filterFn(scanner.detect('Organisationsnummer: 5567037486'))).toHaveLength(0)
  })
})
