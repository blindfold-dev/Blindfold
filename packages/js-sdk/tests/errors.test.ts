import { Blindfold } from '../src/client'
import { AuthenticationError, APIError, NetworkError } from '../src/errors'
import { mockFetchError, mockFetchNetworkError, restoreFetch } from './helpers'

afterEach(restoreFetch)

describe('Error handling', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should throw AuthenticationError on 401', async () => {
    global.fetch = mockFetchError(401)

    await expect(client.tokenize('test')).rejects.toThrow(AuthenticationError)
  })

  test('should throw AuthenticationError on 403', async () => {
    global.fetch = mockFetchError(403)

    await expect(client.detect('test')).rejects.toThrow(AuthenticationError)
  })

  test('should throw APIError on 500 with detail', async () => {
    global.fetch = mockFetchError(500, { detail: 'Internal server error' })

    try {
      await client.redact('test')
      fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).statusCode).toBe(500)
      expect((error as APIError).message).toContain('Internal server error')
    }
  })

  test('should throw APIError on 422 with message', async () => {
    global.fetch = mockFetchError(422, { message: 'Validation failed' })

    try {
      await client.mask('test')
      fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).statusCode).toBe(422)
      expect((error as APIError).message).toContain('Validation failed')
    }
  })

  test('should throw APIError on 429 with response body', async () => {
    const body = { detail: 'Rate limited', retry_after: 60 }
    global.fetch = mockFetchError(429, body)

    try {
      await client.tokenize('test')
      fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).responseBody).toEqual(body)
    }
  })

  test('should throw APIError when error body is unparseable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('Not JSON')),
    })

    await expect(client.synthesize('test')).rejects.toThrow(APIError)
  })

  test('should throw NetworkError on fetch failure', async () => {
    global.fetch = mockFetchNetworkError()

    await expect(client.tokenize('test')).rejects.toThrow(NetworkError)
  })

  test('should throw NetworkError on non-fetch TypeError', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Some random error'))

    await expect(client.hash('test')).rejects.toThrow(NetworkError)
  })
})
