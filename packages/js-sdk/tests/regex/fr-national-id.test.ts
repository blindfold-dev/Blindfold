import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['fr'], entities: [EntityType.FR_NATIONAL_ID] })
const frNationalId = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'French National ID')

describe('French National ID Detection', () => {
  test('should detect valid French National ID', () => {
    const m = frNationalId(scanner.detect('1 85 05 78 006 084 91'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('1 85 05 78 006 084 91')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid compact format', () => {
    const m = frNationalId(scanner.detect('185057800608491'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('185057800608491')
  })

  test('should reject invalid key', () => {
    expect(frNationalId(scanner.detect('185057800608499')).length).toBe(0)
  })
})
