import { PIIScanner } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['us', 'eu', 'uk'] })

describe('Performance', () => {
  test('typical text should complete in under 50ms', () => {
    const text =
      'Dear John Smith, your account has been updated. ' +
      'Please verify your email at john.smith@example.com ' +
      'or call us at +1-555-867-5309. Your SSN 123-45-6789 ' +
      'is on file. Payment was made with card 4532015112830366. ' +
      'Your IP address 192.168.1.100 was logged. ' +
      'For EU customers, IBAN DE89370400440532013000 is accepted. ' +
      'Visit https://example.com/account for more details.'

    const start = performance.now()
    const matches = scanner.detect(text)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(50)
    expect(matches.length).toBeGreaterThan(0)
  })

  test('empty string should be fast', () => {
    const start = performance.now()
    const matches = scanner.detect('')
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(5)
    expect(matches).toEqual([])
  })
})
