import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['dk'], entities: [EntityType.DK_CPR] })
const dkCpr = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Danish CPR')

describe('Danish CPR Detection', () => {
  test('should detect valid Danish CPR with context', () => {
    const m = dkCpr(scanner.detect('CPR: 010190-1234'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('010190-1234')
    expect(m[0].score).toBe(1.0)
  })

  test('should detect valid Danish CPR without hyphen', () => {
    const m = dkCpr(scanner.detect('CPR: 0101901234'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('0101901234')
  })

  test('should reject invalid date (day 32)', () => {
    expect(dkCpr(scanner.detect('CPR: 320190-1234')).length).toBe(0)
  })

  test('should not match without context', () => {
    expect(dkCpr(scanner.detect('010190-1234')).length).toBe(0)
  })
})
