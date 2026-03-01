import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ entities: [EntityType.URL] })
const url = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'URL')

describe('URL Detection', () => {
  test('simple https URL', () => {
    expect(url(scanner.detect('Visit https://example.com')).length).toBe(1)
  })

  test('URL with path', () => {
    expect(url(scanner.detect('See https://example.com/page/about')).length).toBe(1)
  })

  test('http URL', () => {
    expect(url(scanner.detect('Go to http://example.org')).length).toBe(1)
  })

  test('subdomain', () => {
    expect(url(scanner.detect('Visit https://docs.example.io/api')).length).toBe(1)
  })

  // TLD validation
  test('invalid TLD rejected', () => {
    expect(url(scanner.detect('https://example.invalidtld')).length).toBe(0)
  })

  test('fake TLD rejected', () => {
    expect(url(scanner.detect('https://test.localhost')).length).toBe(0)
  })

  // Trailing punctuation
  test('URL followed by period', () => {
    const matches = url(scanner.detect('See https://example.com.'))
    expect(matches.length).toBe(1)
    expect(matches[0].text.endsWith('.')).toBe(false)
  })

  test('URL in parens', () => {
    const matches = url(scanner.detect('(https://example.com)'))
    expect(matches.length).toBe(1)
    expect(matches[0].text.endsWith(')')).toBe(false)
  })

  // Negatives
  test('no scheme not detected', () => {
    expect(url(scanner.detect('Visit example.com')).length).toBe(0)
  })
})
