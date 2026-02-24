import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['us'], entities: [EntityType.SSN] })
const ssn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Social Security Number')

describe('SSN Detection', () => {
  test('should detect valid SSN', () => {
    const m = ssn(scanner.detect('SSN: 123-45-6789'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('123-45-6789')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject area 000', () => {
    expect(ssn(scanner.detect('SSN: 000-12-3456')).length).toBe(0)
  })

  test('should reject area 666', () => {
    expect(ssn(scanner.detect('SSN: 666-12-3456')).length).toBe(0)
  })

  test('should reject area 9xx', () => {
    expect(ssn(scanner.detect('SSN: 900-12-3456')).length).toBe(0)
  })
})
