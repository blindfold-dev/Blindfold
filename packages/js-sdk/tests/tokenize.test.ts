import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(restoreFetch)

describe('tokenize', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should tokenize text with basic params', async () => {
    global.fetch = mockFetchSuccess({
      text: '<Person_1> called yesterday',
      mapping: { '<Person_1>': 'John Doe' },
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    const result = await client.tokenize('John Doe called yesterday')

    expect(result.text).toBe('<Person_1> called yesterday')
    expect(result.mapping).toEqual({ '<Person_1>': 'John Doe' })
    expect(result.detected_entities).toHaveLength(1)
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /tokenize', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      mapping: {},
      detected_entities: [],
      entities_count: 0,
    })

    await client.tokenize('test text')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tokenize'),
      expect.objectContaining({ method: 'POST' })
    )

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.text).toBe('test text')
  })

  test('should pass optional config params', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      mapping: {},
      detected_entities: [],
      entities_count: 0,
    })

    await client.tokenize('test', {
      entities: ['person', 'email address'],
      score_threshold: 0.8,
      policy: 'gdpr_eu',
    })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.entities).toEqual(['person', 'email address'])
    expect(body.score_threshold).toBe(0.8)
    expect(body.policy).toBe('gdpr_eu')
  })
})
