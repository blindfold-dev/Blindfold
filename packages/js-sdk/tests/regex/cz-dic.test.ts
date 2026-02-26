import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['cz'], entities: [EntityType.CZ_DIC] })
const czDic = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Czech DIC')

describe('Czech DIC Detection', () => {
  test('should detect valid DIC with 8 digits (company)', () => {
    // CZ27864898 — uses ICO checksum
    const m = czDic(scanner.detect('DIC: CZ27864898'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('CZ27864898')
  })

  test('should detect valid DIC with 10 digits (individual)', () => {
    // CZ7103192745 — divisible by 11
    const m = czDic(scanner.detect('DIC: CZ7103192745'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('CZ7103192745')
  })

  test('should detect without context (CZ prefix is distinctive)', () => {
    const m = czDic(scanner.detect('CZ27864898'))
    expect(m.length).toBe(1)
  })

  test('should detect case-insensitive prefix', () => {
    const m = czDic(scanner.detect('cz27864898'))
    expect(m.length).toBe(1)
  })

  test('should reject invalid ICO checksum in 8-digit form', () => {
    expect(czDic(scanner.detect('CZ27864899')).length).toBe(0)
  })

  test('should reject 10-digit form not divisible by 11', () => {
    expect(czDic(scanner.detect('CZ7103192746')).length).toBe(0)
  })
})
