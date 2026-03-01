import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['cz'], entities: [EntityType.CZ_BANK_ACCOUNT] })
const czBank = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Czech Bank Account')

describe('Czech Bank Account Detection', () => {
  test('should detect account with prefix', () => {
    // 19-2000145399/0800: common Ceska sporitelna account
    const m = czBank(scanner.detect('Cislo uctu: 19-2000145399/0800'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('19-2000145399/0800')
  })

  test('should detect account without prefix', () => {
    const m = czBank(scanner.detect('Ucet: 2000145399/0800'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('2000145399/0800')
  })

  test('should detect without context keywords (distinctive format)', () => {
    const m = czBank(scanner.detect('19-2000145399/0800'))
    expect(m.length).toBe(1)
  })

  test('should reject invalid account checksum', () => {
    expect(czBank(scanner.detect('Ucet: 2000145398/0800')).length).toBe(0)
  })

  test('should reject invalid bank code length', () => {
    expect(czBank(scanner.detect('Ucet: 2000145399/08')).length).toBe(0)
  })

  test('should not match birth number as bank account', () => {
    // 850101/0001 is a valid Czech birth number (Jan 1 1985, divisible by 11)
    expect(czBank(scanner.detect('850101/0001')).length).toBe(0)
    expect(czBank(scanner.detect('Ucet: 850101/0001')).length).toBe(0)
  })
})
