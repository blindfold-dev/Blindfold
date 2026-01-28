import { Blindfold } from '../src/client'

describe('Detokenize (client-side)', () => {
  let client: Blindfold

  beforeAll(() => {
    client = new Blindfold({ apiKey: 'test-key' })
  })

  test('should detokenize simple text with single token', () => {
    const text = '<Person_1> called yesterday'
    const mapping = {
      '<Person_1>': 'John Doe',
    }

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('John Doe called yesterday')
    expect(result.replacements_made).toBe(1)
  })

  test('should detokenize text with multiple tokens', () => {
    const text = '<Person_1> called <Person_2> at <Email Address_1>'
    const mapping = {
      '<Person_1>': 'John',
      '<Person_2>': 'Jane',
      '<Email Address_1>': 'jane@example.com',
    }

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('John called Jane at jane@example.com')
    expect(result.replacements_made).toBe(3)
  })

  test('should detokenize text with repeated tokens', () => {
    const text = '<Person_1> and <Person_1> went to the store'
    const mapping = {
      '<Person_1>': 'Alice',
    }

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('Alice and Alice went to the store')
    expect(result.replacements_made).toBe(2)
  })

  test('should handle tokens with similar prefixes correctly', () => {
    // Sort by length to avoid <Person_1> partially matching <Person_10>
    const text = '<Person_1> and <Person_10> are friends'
    const mapping = {
      '<Person_1>': 'Bob',
      '<Person_10>': 'Charlie',
    }

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('Bob and Charlie are friends')
    expect(result.replacements_made).toBe(2)
  })

  test('should handle empty text', () => {
    const text = ''
    const mapping = {
      '<Person_1>': 'John',
    }

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('')
    expect(result.replacements_made).toBe(0)
  })

  test('should handle empty mapping', () => {
    const text = '<Person_1> called'
    const mapping = {}

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('<Person_1> called')
    expect(result.replacements_made).toBe(0)
  })

  test('should handle text without tokens', () => {
    const text = 'Hello world'
    const mapping = {
      '<Person_1>': 'John',
    }

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('Hello world')
    expect(result.replacements_made).toBe(0)
  })

  test('should handle special characters in original values', () => {
    const text = 'Email: <Email Address_1>'
    const mapping = {
      '<Email Address_1>': 'user+test@example.com',
    }

    const result = client.detokenize(text, mapping)

    expect(result.text).toBe('Email: user+test@example.com')
    expect(result.replacements_made).toBe(1)
  })

  test('should be synchronous (no API call)', () => {
    const text = '<Person_1> test'
    const mapping = { '<Person_1>': 'Test' }

    // Should return immediately without needing await
    const result = client.detokenize(text, mapping)

    expect(result).toBeDefined()
    expect(result.text).toBe('Test test')
  })
})
