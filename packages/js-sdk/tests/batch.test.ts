import { Blindfold } from '../src/client'
import { mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(() => {
  restoreFetch()
})

const BATCH_RESPONSE = {
  results: [
    {
      text: '<Person_1>',
      mapping: { '<Person_1>': 'John' },
      detected_entities: [{ type: 'Person', text: 'John', start: 0, end: 4, score: 0.95 }],
      entities_count: 1,
    },
    { text: 'no PII here', mapping: {}, detected_entities: [], entities_count: 0 },
  ],
  total: 2,
  succeeded: 2,
  failed: 0,
}

const BATCH_DETECT_RESPONSE = {
  results: [
    { detected_entities: [{ type: 'Person', text: 'John', start: 0, end: 4, score: 0.95 }], entities_count: 1 },
    { detected_entities: [], entities_count: 0 },
  ],
  total: 2,
  succeeded: 2,
  failed: 0,
}

const BATCH_WITH_FAILURE = {
  results: [
    { text: '<Person_1>', mapping: {}, detected_entities: [], entities_count: 1 },
    { error: 'Processing failed' },
  ],
  total: 2,
  succeeded: 1,
  failed: 1,
}

describe('Batch methods', () => {
  const client = new Blindfold({ apiKey: 'test-key', maxRetries: 0 })

  describe('tokenizeBatch', () => {
    it('should send texts array and return batch response', async () => {
      const fetchMock = mockFetchSuccess(BATCH_RESPONSE)
      global.fetch = fetchMock

      const result = await client.tokenizeBatch(['John', 'no PII here'])

      expect(result.total).toBe(2)
      expect(result.succeeded).toBe(2)
      expect(result.failed).toBe(0)
      expect(result.results).toHaveLength(2)
      expect(result.results[0].text).toBe('<Person_1>')

      const body = getFetchBody(fetchMock)
      expect(body.texts).toEqual(['John', 'no PII here'])
      expect(body.text).toBeUndefined()
    })

    it('should pass optional config', async () => {
      const fetchMock = mockFetchSuccess(BATCH_RESPONSE)
      global.fetch = fetchMock

      await client.tokenizeBatch(['text1', 'text2'], {
        policy: 'gdpr_eu',
        entities: ['Person'],
        score_threshold: 0.7,
      })

      const body = getFetchBody(fetchMock)
      expect(body.policy).toBe('gdpr_eu')
      expect(body.entities).toEqual(['Person'])
      expect(body.score_threshold).toBe(0.7)
    })
  })

  describe('detectBatch', () => {
    it('should return batch detect results', async () => {
      global.fetch = mockFetchSuccess(BATCH_DETECT_RESPONSE)

      const result = await client.detectBatch(['John Doe', 'no PII'])

      expect(result.total).toBe(2)
      expect(result.succeeded).toBe(2)
      expect(result.results[0].entities_count).toBe(1)
    })
  })

  describe('redactBatch', () => {
    it('should send masking_char config', async () => {
      const fetchMock = mockFetchSuccess(BATCH_RESPONSE)
      global.fetch = fetchMock

      await client.redactBatch(['text1', 'text2'], { masking_char: '#' })

      const body = getFetchBody(fetchMock)
      expect(body.texts).toEqual(['text1', 'text2'])
      expect(body.masking_char).toBe('#')
    })
  })

  describe('maskBatch', () => {
    it('should send mask config', async () => {
      const fetchMock = mockFetchSuccess(BATCH_RESPONSE)
      global.fetch = fetchMock

      await client.maskBatch(['text1'], { chars_to_show: 4, from_end: true })

      const body = getFetchBody(fetchMock)
      expect(body.chars_to_show).toBe(4)
      expect(body.from_end).toBe(true)
    })
  })

  describe('synthesizeBatch', () => {
    it('should send language config', async () => {
      const fetchMock = mockFetchSuccess(BATCH_RESPONSE)
      global.fetch = fetchMock

      await client.synthesizeBatch(['text1'], { language: 'de' })

      const body = getFetchBody(fetchMock)
      expect(body.language).toBe('de')
    })
  })

  describe('hashBatch', () => {
    it('should send hash config', async () => {
      const fetchMock = mockFetchSuccess(BATCH_RESPONSE)
      global.fetch = fetchMock

      await client.hashBatch(['text1'], { hash_type: 'md5', hash_length: 8 })

      const body = getFetchBody(fetchMock)
      expect(body.hash_type).toBe('md5')
      expect(body.hash_length).toBe(8)
    })
  })

  describe('encryptBatch', () => {
    it('should send encryption_key config', async () => {
      const fetchMock = mockFetchSuccess(BATCH_RESPONSE)
      global.fetch = fetchMock

      await client.encryptBatch(['text1'], { encryption_key: 'my-secret-key-1234' })

      const body = getFetchBody(fetchMock)
      expect(body.encryption_key).toBe('my-secret-key-1234')
    })
  })

  describe('batch with partial failure', () => {
    it('should return failed count and error objects', async () => {
      global.fetch = mockFetchSuccess(BATCH_WITH_FAILURE)

      const result = await client.tokenizeBatch(['text1', 'text2'])

      expect(result.total).toBe(2)
      expect(result.succeeded).toBe(1)
      expect(result.failed).toBe(1)
      expect(result.results[1]).toHaveProperty('error')
    })
  })

  describe('all batch methods exist', () => {
    it('should have all 7 batch methods', () => {
      const methods = [
        'tokenizeBatch',
        'detectBatch',
        'redactBatch',
        'maskBatch',
        'synthesizeBatch',
        'hashBatch',
        'encryptBatch',
      ]
      for (const method of methods) {
        expect(typeof (client as Record<string, unknown>)[method]).toBe('function')
      }
    })
  })
})
