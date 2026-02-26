import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['uk'], entities: [EntityType.UK_UTR] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'UK UTR')

describe('UK UTR Detection', () => {
  test('should detect valid UTR with context', () => {
    const m = filterFn(scanner.detect('UTR: 1123456789'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('1123456789')
  })

  test('should not detect without context', () => {
    expect(filterFn(scanner.detect('1123456789'))).toHaveLength(0)
  })
})
