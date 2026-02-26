import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['be'], entities: [EntityType.BE_NATIONAL_NUMBER] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Belgian National Number')

describe('Belgian National Number Detection', () => {
  test('should detect valid national number with context', () => {
    const m = filterFn(scanner.detect('National number: 85.07.30-033.28'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('85.07.30-033.28')
  })

  test('should reject invalid check digits', () => {
    expect(filterFn(scanner.detect('National number: 85.07.30-033.29'))).toHaveLength(0)
  })
})
