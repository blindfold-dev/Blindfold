import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['dk'], entities: [EntityType.DK_CVR] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Danish CVR')

describe('Danish CVR Detection', () => {
  test('should detect valid CVR with context', () => {
    const m = filterFn(scanner.detect('CVR: 13585628'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('13585628')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('CVR: 13585629'))).toHaveLength(0)
  })
})
