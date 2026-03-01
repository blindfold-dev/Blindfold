import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['pt'], entities: [EntityType.PT_NIF] })
const ptNif = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Portuguese NIF')

describe('Portuguese NIF Detection', () => {
  test('should detect valid Portuguese NIF with context', () => {
    const m = ptNif(scanner.detect('NIF: 199999996'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('199999996')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(ptNif(scanner.detect('NIF: 199999999')).length).toBe(0)
  })

  test('should not match without context', () => {
    expect(ptNif(scanner.detect('199999996')).length).toBe(0)
  })
})
