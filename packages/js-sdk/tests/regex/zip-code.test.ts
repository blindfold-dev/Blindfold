import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['us'], entities: [EntityType.ZIP_CODE] })
const zip = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'ZIP Code')

describe('ZIP Code Detection', () => {
  test('5-digit ZIP', () => {
    expect(zip(scanner.detect('zip code: 90210')).length).toBe(1)
  })

  test('ZIP+4 format', () => {
    expect(zip(scanner.detect('zip: 90210-1234')).length).toBe(1)
  })

  // Expanded context keywords
  test('address keyword', () => {
    expect(zip(scanner.detect('address: 123 Main St, 90210')).length).toBe(1)
  })

  test('city keyword', () => {
    expect(zip(scanner.detect('city: Beverly Hills, 90210')).length).toBe(1)
  })

  test('shipping keyword', () => {
    expect(zip(scanner.detect('shipping to 90210')).length).toBe(1)
  })

  test('state keyword', () => {
    expect(zip(scanner.detect('state: CA 90210')).length).toBe(1)
  })

  // Validator
  test('valid zip', () => {
    expect(zip(scanner.detect('zip: 10001')).length).toBe(1)
  })

  test('invalid 000 prefix rejected', () => {
    expect(zip(scanner.detect('zip: 00012')).length).toBe(0)
  })

  // Negatives
  test('no context no match', () => {
    expect(zip(scanner.detect('The number is 90210')).length).toBe(0)
  })
})
