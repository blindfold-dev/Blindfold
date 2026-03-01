import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['cz'], entities: [EntityType.CZ_ICO] })
const czIco = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Czech ICO')

describe('Czech ICO Detection', () => {
  test('should detect valid ICO with context', () => {
    // 27864898: weights 8*2+7*7+6*8+5*6+4*4+3*8+2*9 = 16+49+48+30+16+24+18 = 201, 201%11=3, 11-3=8 ✓
    const m = czIco(scanner.detect('ICO: 27864898'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('27864898')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect with Czech keyword', () => {
    const m = czIco(scanner.detect('Identifikacni cislo: 25596641'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('25596641')
  })

  test('should reject invalid checksum', () => {
    expect(czIco(scanner.detect('ICO: 27864899')).length).toBe(0)
  })

  test('should not match without context', () => {
    expect(czIco(scanner.detect('27864898')).length).toBe(0)
  })

  test('should not match non-8-digit numbers', () => {
    expect(czIco(scanner.detect('ICO: 1234567')).length).toBe(0)
    expect(czIco(scanner.detect('ICO: 123456789')).length).toBe(0)
  })
})
