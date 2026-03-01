import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['de'], entities: [EntityType.DE_TAX_ID] })
const deTaxId = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'German Tax ID')

describe('German Tax ID Detection', () => {
  test('should detect valid German Tax ID', () => {
    const m = deTaxId(scanner.detect('65 929 970 489'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('65 929 970 489')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid compact format', () => {
    const m = deTaxId(scanner.detect('65929970489'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('65929970489')
  })

  test('should reject invalid checksum', () => {
    expect(deTaxId(scanner.detect('65929970488')).length).toBe(0)
  })
})
