import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(restoreFetch)

describe('synthesize', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should synthesize text', async () => {
    global.fetch = mockFetchSuccess({
      text: 'Jane Smith called yesterday',
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    const result = await client.synthesize('John Doe called yesterday')

    expect(result.text).toBe('Jane Smith called yesterday')
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /synthesize', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.synthesize('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/synthesize'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('should pass language config', async () => {
    global.fetch = mockFetchSuccess({
      text: 'Jan Novak',
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    await client.synthesize('John Doe', { language: 'cs' })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.language).toBe('cs')
  })

  test('should pass policy and entities', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.synthesize('test', { policy: 'hipaa_us', entities: ['person'] })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.policy).toBe('hipaa_us')
    expect(body.entities).toEqual(['person'])
  })
})
