import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['br'], entities: [EntityType.BR_CNPJ] })
const brCnpj = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Brazilian CNPJ')

describe('Brazilian CNPJ Detection', () => {
  test('should detect valid formatted Brazilian CNPJ', () => {
    const m = brCnpj(scanner.detect('11.222.333/0001-81'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('11.222.333/0001-81')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid compact format', () => {
    const m = brCnpj(scanner.detect('11222333000181'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('11222333000181')
  })

  test('should reject invalid checksum', () => {
    expect(brCnpj(scanner.detect('11.222.333/0001-82')).length).toBe(0)
  })
})
