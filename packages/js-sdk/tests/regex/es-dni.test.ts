import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['es'], entities: [EntityType.ES_DNI] })
const esDni = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Spanish DNI')

describe('Spanish DNI Detection', () => {
  test('should detect valid Spanish DNI', () => {
    const m = esDni(scanner.detect('12345678Z'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('12345678Z')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid DNI with separator', () => {
    const m = esDni(scanner.detect('12345678-Z'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('12345678-Z')
  })

  test('should reject invalid letter', () => {
    expect(esDni(scanner.detect('12345678A')).length).toBe(0)
  })
})
