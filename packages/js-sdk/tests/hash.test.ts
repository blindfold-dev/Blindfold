import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(restoreFetch)

describe('hash', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should hash text', async () => {
    global.fetch = mockFetchSuccess({
      text: 'HASH_a1b2c3d4e5f67890 called yesterday',
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    const result = await client.hash('John Doe called yesterday')

    expect(result.text).toContain('HASH_')
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /hash', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.hash('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/hash'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('should pass hash config options', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.hash('test', {
      hash_type: 'md5',
      hash_prefix: 'H_',
      hash_length: 8,
    })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.hash_type).toBe('md5')
    expect(body.hash_prefix).toBe('H_')
    expect(body.hash_length).toBe(8)
  })

  test('should pass entities filter', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.hash('test', {
      entities: ['email address'],
      score_threshold: 0.7,
    })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.entities).toEqual(['email address'])
    expect(body.score_threshold).toBe(0.7)
  })
})
