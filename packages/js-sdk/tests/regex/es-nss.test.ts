import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['es'], entities: [EntityType.ES_NSS] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Spanish NSS')

describe('Spanish NSS Detection', () => {
  test('should detect valid NSS with context', () => {
    const m = filterFn(scanner.detect('NSS: 281234567840'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('281234567840')
  })

  test('should reject invalid check digits', () => {
    expect(filterFn(scanner.detect('NSS: 281234567890'))).toHaveLength(0)
  })
})
