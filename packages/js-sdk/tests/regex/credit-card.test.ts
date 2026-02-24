import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ entities: [EntityType.CREDIT_CARD] })
const cc = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Credit Card Number')

describe('Credit Card Detection', () => {
  test('should detect valid Visa with Luhn score 1.0', () => {
    const matches = cc(scanner.detect('Card: 4532015112830366'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should detect valid Mastercard', () => {
    const matches = cc(scanner.detect('Card: 5425233430109903'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should detect valid Amex', () => {
    const matches = cc(scanner.detect('Card: 378282246310005'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should detect card with dashes', () => {
    const matches = cc(scanner.detect('Card: 4532-0151-1283-0366'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should detect card with spaces', () => {
    const matches = cc(scanner.detect('Card: 4532 0151 1283 0366'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should reject invalid Luhn', () => {
    expect(cc(scanner.detect('Card: 4532015112830367')).length).toBe(0)
  })

  test('should reject random 16 digits failing Luhn', () => {
    expect(cc(scanner.detect('Card: 4111111111111112')).length).toBe(0)
  })
})
