import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['br'], entities: [EntityType.BR_CPF] })
const brCpf = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Brazilian CPF')

describe('Brazilian CPF Detection', () => {
  test('should detect valid formatted Brazilian CPF', () => {
    const m = brCpf(scanner.detect('529.982.247-25'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('529.982.247-25')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid compact format', () => {
    const m = brCpf(scanner.detect('52998224725'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('52998224725')
  })

  test('should reject invalid checksum', () => {
    expect(brCpf(scanner.detect('529.982.247-26')).length).toBe(0)
  })

  test('should reject all same digits', () => {
    expect(brCpf(scanner.detect('111.111.111-11')).length).toBe(0)
  })
})
