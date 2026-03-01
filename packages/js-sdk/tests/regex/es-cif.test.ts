import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['es'], entities: [EntityType.ES_CIF] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Spanish CIF')

describe('Spanish CIF Detection', () => {
  test('should detect valid CIF', () => {
    const m = filterFn(scanner.detect('CIF: A58818501'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('A58818501')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('CIF: A58818502'))).toHaveLength(0)
  })
})
