import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['si'], entities: [EntityType.SI_EMSO] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Slovenian EMSO')

describe('Slovenian EMSO Detection', () => {
  test('should detect valid EMSO with context', () => {
    const m = filterFn(scanner.detect('EMSO: 0101006500006'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('0101006500006')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('EMSO: 0101006500007'))).toHaveLength(0)
  })
})
