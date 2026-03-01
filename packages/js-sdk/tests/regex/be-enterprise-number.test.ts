import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['be'], entities: [EntityType.BE_ENTERPRISE_NUMBER] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Belgian Enterprise Number')

describe('Belgian Enterprise Number Detection', () => {
  test('should detect valid enterprise number with context', () => {
    const m = filterFn(scanner.detect('BCE: 0202.239.951'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('0202.239.951')
  })

  test('should reject invalid check digits', () => {
    expect(filterFn(scanner.detect('BCE: 0202.239.952'))).toHaveLength(0)
  })
})
