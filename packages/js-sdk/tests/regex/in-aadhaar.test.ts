import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['in'], entities: [EntityType.IN_AADHAAR] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Indian Aadhaar')

describe('Indian Aadhaar Detection', () => {
  test('should detect valid Aadhaar with context', () => {
    const m = filterFn(scanner.detect('Aadhaar: 2345 6789 0124'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('2345 6789 0124')
  })

  test('should reject number starting with 0', () => {
    expect(filterFn(scanner.detect('Aadhaar: 0123 4567 8901'))).toHaveLength(0)
  })
})
