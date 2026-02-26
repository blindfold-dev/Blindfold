import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['fi'], entities: [EntityType.FI_HETU] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Finnish HETU')

describe('Finnish HETU Detection', () => {
  test('should detect valid HETU', () => {
    const m = filterFn(scanner.detect('131052A308T'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('131052A308T')
  })

  test('should reject invalid check character', () => {
    expect(filterFn(scanner.detect('131052A308A'))).toHaveLength(0)
  })
})
