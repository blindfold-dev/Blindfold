import { Blindfold } from '../src/client'
import { mockFetchSuccess, restoreFetch } from './helpers'

afterEach(restoreFetch)

describe('Client initialization', () => {
  test('should use default base URL', () => {
    const client = new Blindfold({ apiKey: 'test-key' })
    expect(client).toBeDefined()
  })

  test('should accept custom base URL', () => {
    const client = new Blindfold({
      apiKey: 'test-key',
      baseUrl: 'https://custom.api.dev/v1',
    })
    expect(client).toBeDefined()
  })

  test('should accept user ID', () => {
    const client = new Blindfold({
      apiKey: 'test-key',
      userId: 'user-123',
    })
    expect(client).toBeDefined()
  })

  test('should send X-API-Key header', async () => {
    const client = new Blindfold({ apiKey: 'test-key' })
    global.fetch = mockFetchSuccess({
      text: '',
      mapping: {},
      detected_entities: [],
      entities_count: 0,
    })

    await client.tokenize('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: expect.objectContaining({
          'X-API-Key': 'test-key',
        }),
      })
    )
  })

  test('should send X-Blindfold-User-Id header when userId set', async () => {
    const client = new Blindfold({ apiKey: 'test-key', userId: 'user-123' })
    global.fetch = mockFetchSuccess({
      text: '',
      mapping: {},
      detected_entities: [],
      entities_count: 0,
    })

    await client.tokenize('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: expect.objectContaining({
          'X-Blindfold-User-Id': 'user-123',
        }),
      })
    )
  })
})
