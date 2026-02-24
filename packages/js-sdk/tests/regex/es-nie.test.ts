import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['es'], entities: [EntityType.ES_NIE] })
const esNie = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Spanish NIE')

describe('Spanish NIE Detection', () => {
  test('should detect valid Spanish NIE', () => {
    const m = esNie(scanner.detect('X1234567L'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('X1234567L')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid letter', () => {
    expect(esNie(scanner.detect('X1234567A')).length).toBe(0)
  })
})
