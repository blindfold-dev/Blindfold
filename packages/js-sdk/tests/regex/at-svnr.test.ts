import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['at'], entities: [EntityType.AT_SVNR] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Austrian SVNR')

describe('Austrian SVNR Detection', () => {
  test('should detect valid SVNR with context', () => {
    const m = filterFn(scanner.detect('SVNR: 1237010180'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('1237010180')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('SVNR: 1230010180'))).toHaveLength(0)
  })
})
