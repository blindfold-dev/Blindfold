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

  test('should detect Mastercard 2-series', () => {
    const matches = cc(scanner.detect('Card: 2221000000000009'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should detect Mastercard 2-series with dashes', () => {
    expect(cc(scanner.detect('Card: 2720-9900-0000-0007')).length).toBe(1)
  })

  test('should detect Diners Club', () => {
    const matches = cc(scanner.detect('Card: 30569309025904'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should detect Diners Club 36 prefix', () => {
    expect(cc(scanner.detect('Card: 36700102000000')).length).toBe(1)
  })

  test('should detect JCB', () => {
    const matches = cc(scanner.detect('Card: 3530111333300000'))
    expect(matches.length).toBe(1)
    expect(matches[0].score).toBe(1.0)
  })

  test('should detect UnionPay 16-digit', () => {
    expect(cc(scanner.detect('Card: 6212345678901232')).length).toBe(1)
  })

  test('should detect Visa 13-digit', () => {
    expect(cc(scanner.detect('Card: 4222222222222')).length).toBe(1)
  })

  test('should reject invalid Luhn', () => {
    expect(cc(scanner.detect('Card: 4532015112830367')).length).toBe(0)
  })

  test('should reject random 16 digits failing Luhn', () => {
    expect(cc(scanner.detect('Card: 4111111111111112')).length).toBe(0)
  })
})
