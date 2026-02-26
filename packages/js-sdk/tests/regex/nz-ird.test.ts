import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['nz'], entities: [EntityType.NZ_IRD] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'New Zealand IRD')

describe('New Zealand IRD Detection', () => {
  test('should detect valid IRD with context', () => {
    const m = filterFn(scanner.detect('IRD: 49-091-850'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('49-091-850')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('IRD: 49-091-851'))).toHaveLength(0)
  })
})
