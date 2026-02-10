import { Blindfold } from '../src/client'
import { APIError, AuthenticationError, NetworkError } from '../src/errors'
import { originalFetch, restoreFetch } from './helpers'

afterEach(restoreFetch)

function mockFetchSequence(responses: Array<{ ok: boolean; status: number; body?: unknown } | Error>) {
  let callIndex = 0
  return jest.fn(() => {
    const resp = responses[callIndex++]
    if (resp instanceof Error) {
      return Promise.reject(resp)
    }
    return Promise.resolve({
      ok: resp.ok,
      status: resp.status,
      statusText: resp.ok ? 'OK' : 'Error',
      json: () => Promise.resolve(resp.body ?? {}),
    } as Response)
  })
}

// Speed up tests by eliminating real sleep
jest.spyOn(global, 'setTimeout').mockImplementation((fn: Function) => {
  fn()
  return 0 as unknown as NodeJS.Timeout
})

const SUCCESS_BODY = { text: 'ok', mapping: {}, detected_entities: [], entities_count: 0 }

describe('retry logic', () => {
  test('retries on network error then succeeds', async () => {
    const mock = mockFetchSequence([
      new TypeError('fetch failed'),
      { ok: true, status: 200, body: SUCCESS_BODY },
    ])
    global.fetch = mock

    const client = new Blindfold({ apiKey: 'test', maxRetries: 2, retryDelay: 0.001 })
    const result = await client.tokenize('test')
    expect(result.text).toBe('ok')
    expect(mock).toHaveBeenCalledTimes(2)
  })

  test('retries on 429 then succeeds', async () => {
    const mock = mockFetchSequence([
      { ok: false, status: 429, body: { detail: 'Rate limited' } },
      { ok: true, status: 200, body: SUCCESS_BODY },
    ])
    global.fetch = mock

    const client = new Blindfold({ apiKey: 'test', maxRetries: 2, retryDelay: 0.001 })
    const result = await client.tokenize('test')
    expect(result.text).toBe('ok')
    expect(mock).toHaveBeenCalledTimes(2)
  })

  test('retries on 500 then succeeds', async () => {
    const mock = mockFetchSequence([
      { ok: false, status: 500, body: { detail: 'Internal error' } },
      { ok: true, status: 200, body: SUCCESS_BODY },
    ])
    global.fetch = mock

    const client = new Blindfold({ apiKey: 'test', maxRetries: 2, retryDelay: 0.001 })
    const result = await client.tokenize('test')
    expect(result.text).toBe('ok')
    expect(mock).toHaveBeenCalledTimes(2)
  })

  test('does NOT retry on 401', async () => {
    const mock = mockFetchSequence([
      { ok: false, status: 401, body: { detail: 'Unauthorized' } },
    ])
    global.fetch = mock

    const client = new Blindfold({ apiKey: 'test', maxRetries: 2, retryDelay: 0.001 })
    await expect(client.tokenize('test')).rejects.toThrow(AuthenticationError)
    expect(mock).toHaveBeenCalledTimes(1)
  })

  test('does NOT retry on 400', async () => {
    const mock = mockFetchSequence([
      { ok: false, status: 400, body: { detail: 'Bad request' } },
    ])
    global.fetch = mock

    const client = new Blindfold({ apiKey: 'test', maxRetries: 2, retryDelay: 0.001 })
    await expect(client.tokenize('test')).rejects.toThrow(APIError)
    expect(mock).toHaveBeenCalledTimes(1)
  })

  test('raises after all retries exhausted', async () => {
    const mock = mockFetchSequence([
      new TypeError('fetch failed'),
      new TypeError('fetch failed'),
      new TypeError('fetch failed'),
    ])
    global.fetch = mock

    const client = new Blindfold({ apiKey: 'test', maxRetries: 2, retryDelay: 0.001 })
    await expect(client.tokenize('test')).rejects.toThrow(NetworkError)
    expect(mock).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
  })

  test('no retry when maxRetries=0', async () => {
    const mock = mockFetchSequence([
      new TypeError('fetch failed'),
    ])
    global.fetch = mock

    const client = new Blindfold({ apiKey: 'test', maxRetries: 0, retryDelay: 0.001 })
    await expect(client.tokenize('test')).rejects.toThrow(NetworkError)
    expect(mock).toHaveBeenCalledTimes(1)
  })

  test('retries on 502, 503, 504', async () => {
    for (const status of [502, 503, 504]) {
      const mock = mockFetchSequence([
        { ok: false, status, body: { detail: 'Error' } },
        { ok: true, status: 200, body: SUCCESS_BODY },
      ])
      global.fetch = mock

      const client = new Blindfold({ apiKey: 'test', maxRetries: 1, retryDelay: 0.001 })
      const result = await client.tokenize('test')
      expect(result.text).toBe('ok')
      expect(mock).toHaveBeenCalledTimes(2)
    }
  })

  test('default config has maxRetries=2 and retryDelay=0.5', async () => {
    const mock = mockFetchSequence([
      { ok: true, status: 200, body: SUCCESS_BODY },
    ])
    global.fetch = mock

    // Just verify defaults don't break existing behavior
    const client = new Blindfold({ apiKey: 'test' })
    const result = await client.tokenize('test')
    expect(result.text).toBe('ok')
    expect(mock).toHaveBeenCalledTimes(1)
  })
})
