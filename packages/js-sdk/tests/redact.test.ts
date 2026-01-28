import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(restoreFetch)

describe('redact', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should redact text', async () => {
    global.fetch = mockFetchSuccess({
      text: '******** called yesterday',
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    const result = await client.redact('John Doe called yesterday')

    expect(result.text).toBe('******** called yesterday')
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /redact', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.redact('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/redact'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('should pass masking_char config', async () => {
    global.fetch = mockFetchSuccess({
      text: 'XXXX called',
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    await client.redact('John called', { masking_char: 'X' })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.masking_char).toBe('X')
  })

  test('should pass policy and entities', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.redact('test', { policy: 'gdpr_eu', entities: ['person'] })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.policy).toBe('gdpr_eu')
    expect(body.entities).toEqual(['person'])
  })
})
