import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ro'], entities: [EntityType.RO_CUI] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Romanian CUI')

describe('Romanian CUI Detection', () => {
  test('should detect valid CUI with context', () => {
    const m = filterFn(scanner.detect('CUI: 18189442'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('18189442')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('CUI: 18189443'))).toHaveLength(0)
  })
})
