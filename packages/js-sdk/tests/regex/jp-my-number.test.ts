import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['jp'], entities: [EntityType.JP_MY_NUMBER] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Japanese My Number')

describe('Japanese My Number Detection', () => {
  test('should detect valid My Number with context', () => {
    const m = filterFn(scanner.detect('My Number: 1234 5678 9018'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('1234 5678 9018')
  })

  test('should reject invalid check digit', () => {
    expect(filterFn(scanner.detect('My Number: 1234 5678 9013'))).toHaveLength(0)
  })
})
