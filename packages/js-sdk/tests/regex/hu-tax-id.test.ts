import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['hu'], entities: [EntityType.HU_TAX_ID] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Hungarian Tax ID')

describe('Hungarian Tax ID Detection', () => {
  test('should detect valid tax ID with context', () => {
    const m = filterFn(scanner.detect('Tax ID: 8071592153'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('8071592153')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('Tax ID: 8071592154'))).toHaveLength(0)
  })
})
