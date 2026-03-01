import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['no'], entities: [EntityType.NO_BIRTH_NUMBER] })
const noBirthNumber = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Norwegian Birth Number')

describe('Norwegian Birth Number Detection', () => {
  test('should detect valid Norwegian Birth Number', () => {
    const m = noBirthNumber(scanner.detect('01010750160'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('01010750160')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(noBirthNumber(scanner.detect('01010750161')).length).toBe(0)
  })
})
