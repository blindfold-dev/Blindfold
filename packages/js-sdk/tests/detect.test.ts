import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(restoreFetch)

describe('detect', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should detect entities in text', async () => {
    global.fetch = mockFetchSuccess({
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    const result = await client.detect('John Doe called')

    expect(result.detected_entities).toHaveLength(1)
    expect(result.detected_entities[0].entity_type).toBe('person')
    expect(result.detected_entities[0].text).toBe('John Doe')
    expect(result.detected_entities[0].score).toBe(0.95)
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /detect', async () => {
    global.fetch = mockFetchSuccess({
      detected_entities: [],
      entities_count: 0,
    })

    await client.detect('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/detect'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('should pass config options', async () => {
    global.fetch = mockFetchSuccess({
      detected_entities: [],
      entities_count: 0,
    })

    await client.detect('test', {
      entities: ['email address'],
      score_threshold: 0.5,
      policy: 'hipaa_us',
    })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.entities).toEqual(['email address'])
    expect(body.score_threshold).toBe(0.5)
    expect(body.policy).toBe('hipaa_us')
  })

  test('should handle no entities found', async () => {
    global.fetch = mockFetchSuccess({
      detected_entities: [],
      entities_count: 0,
    })

    const result = await client.detect('Hello world')

    expect(result.detected_entities).toEqual([])
    expect(result.entities_count).toBe(0)
  })
})
