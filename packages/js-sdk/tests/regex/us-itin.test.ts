import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['us'], entities: [EntityType.US_ITIN] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'US ITIN')

describe('US ITIN Detection', () => {
  test('should detect valid ITIN with context', () => {
    const m = filterFn(scanner.detect('ITIN: 912-70-1234'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('912-70-1234')
  })

  test('should reject number not starting with 9', () => {
    expect(filterFn(scanner.detect('ITIN: 123-45-6789'))).toHaveLength(0)
  })
})
