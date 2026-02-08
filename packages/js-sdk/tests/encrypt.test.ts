import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(restoreFetch)

describe('encrypt', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should encrypt text', async () => {
    global.fetch = mockFetchSuccess({
      text: 'ENC(abc123xyz) called yesterday',
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    const result = await client.encrypt('John Doe called yesterday')

    expect(result.text).toBe('ENC(abc123xyz) called yesterday')
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /encrypt', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.encrypt('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/encrypt'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('should pass encryption_key config', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.encrypt('test', { encryption_key: 'my-secret-key' })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.encryption_key).toBe('my-secret-key')
  })

  test('should not include encryption_key when not provided', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.encrypt('test')

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.encryption_key).toBeUndefined()
  })

  test('should pass policy and entities', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.encrypt('test', { policy: 'gdpr_eu', entities: ['person'] })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.policy).toBe('gdpr_eu')
    expect(body.entities).toEqual(['person'])
  })
})
