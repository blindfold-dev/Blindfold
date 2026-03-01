import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['eu'], entities: [EntityType.IBAN] })
const iban = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'IBAN')

describe('IBAN Detection', () => {
  test('should detect valid German IBAN', () => {
    const m = iban(scanner.detect('IBAN: DE89370400440532013000'))
    expect(m.length).toBe(1)
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid GB IBAN', () => {
    const m = iban(scanner.detect('IBAN: GB29NWBK60161331926819'))
    expect(m.length).toBe(1)
    expect(m[0].score).toBe(1.0)
  })

  test('should detect IBAN with spaces', () => {
    const m = iban(scanner.detect('IBAN: DE89 3704 0044 0532 0130 00'))
    expect(m.length).toBe(1)
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(iban(scanner.detect('IBAN: DE00370400440532013000')).length).toBe(0)
  })

  test('should reject invalid GB checksum', () => {
    expect(iban(scanner.detect('IBAN: GB00NWBK60161331926819')).length).toBe(0)
  })
})
