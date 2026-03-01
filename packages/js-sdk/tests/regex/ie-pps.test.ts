import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ie'], entities: [EntityType.IE_PPS] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Irish PPS Number')

describe('Irish PPS Number Detection', () => {
  test('should detect valid PPS number with context', () => {
    const m = filterFn(scanner.detect('PPS: 1234567T'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('1234567T')
  })

  test('should reject invalid check letter', () => {
    expect(filterFn(scanner.detect('PPS: 1234567A'))).toHaveLength(0)
  })
})
