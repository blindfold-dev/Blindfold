import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['kr'], entities: [EntityType.KR_RRN] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Korean RRN')

describe('Korean RRN Detection', () => {
  test('should detect valid RRN with context', () => {
    const m = filterFn(scanner.detect('Resident registration: 900101-1234568'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('900101-1234568')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('Resident registration: 900101-1234560'))).toHaveLength(0)
  })
})
