import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['pl'], entities: [EntityType.PL_PESEL] })
const plPesel = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Polish PESEL')

describe('Polish PESEL Detection', () => {
  test('should detect valid Polish PESEL', () => {
    const m = plPesel(scanner.detect('44051401359'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('44051401359')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(plPesel(scanner.detect('44051401358')).length).toBe(0)
  })
})
