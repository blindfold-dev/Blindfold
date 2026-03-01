import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['in'], entities: [EntityType.IN_PAN] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Indian PAN')

describe('Indian PAN Detection', () => {
  test('should detect valid PAN with context', () => {
    const m = filterFn(scanner.detect('PAN: ABCPD1234E'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('ABCPD1234E')
  })

  test('should reject invalid 4th character', () => {
    expect(filterFn(scanner.detect('PAN: ABCZD1234E'))).toHaveLength(0)
  })
})
