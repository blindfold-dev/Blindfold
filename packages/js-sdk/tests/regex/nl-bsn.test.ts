import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['nl'], entities: [EntityType.NL_BSN] })
const nlBsn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Dutch BSN')

describe('Dutch BSN Detection', () => {
  test('should detect valid Dutch BSN with context', () => {
    const m = nlBsn(scanner.detect('BSN: 111222333'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('111222333')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(nlBsn(scanner.detect('BSN: 111222334')).length).toBe(0)
  })

  test('should not match without context', () => {
    expect(nlBsn(scanner.detect('111222333')).length).toBe(0)
  })
})
