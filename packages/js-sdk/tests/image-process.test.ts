import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, restoreFetch } from './helpers'

afterEach(restoreFetch)

const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function mockImageFetchSuccess(opts?: {
  entities?: unknown[]
  mapping?: Record<string, string>
  ocrConfidence?: number | null
}) {
  const entities = opts?.entities ?? [SAMPLE_ENTITY]
  const mapping = opts?.mapping ?? { 'John Doe': '<Person_1>' }
  const ocrConfidence = opts?.ocrConfidence !== undefined ? opts.ocrConfidence : 85.3

  const headers = new Headers({
    'content-type': 'image/png',
    'x-entities-count': String(entities.length),
    'x-detected-entities': JSON.stringify(entities),
    'x-mapping': JSON.stringify(mapping),
    'x-ocr-confidence': ocrConfidence !== null ? String(ocrConfidence) : '',
  })

  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers,
    arrayBuffer: () => Promise.resolve(PNG_BYTES.buffer),
  })
}

function getFetchFormData(fetchMock: jest.Mock): FormData {
  const calls = fetchMock.mock.calls
  const lastCall = calls[calls.length - 1] as [string, RequestInit]
  return lastCall[1].body as unknown as FormData
}

function getFetchUrl(fetchMock: jest.Mock): string {
  const calls = fetchMock.mock.calls
  const lastCall = calls[calls.length - 1] as [string, RequestInit]
  return lastCall[0]
}

describe('imageTokenize', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should return image and metadata', async () => {
    global.fetch = mockImageFetchSuccess()
    const result = await client.imageTokenize(Buffer.from('fake'))

    expect(result.image).toBeInstanceOf(ArrayBuffer)
    expect(result.entities_count).toBe(1)
    expect(result.detected_entities).toHaveLength(1)
    expect(result.mapping).toEqual({ 'John Doe': '<Person_1>' })
    expect(result.ocr_confidence).toBe(85.3)
  })

  test('should send POST to /file/tokenize', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageTokenize(Buffer.from('img'))
    expect(getFetchUrl(global.fetch as jest.Mock)).toContain('/file/tokenize')
  })

  test('should pass config options as form data', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageTokenize(Buffer.from('img'), {
      language: 'deu',
      entities: ['person', 'email address'],
      score_threshold: 0.8,
      policy: 'gdpr_eu',
    })

    const formData = getFetchFormData(global.fetch as jest.Mock)
    expect(formData.get('language')).toBe('deu')
    expect(formData.get('entities')).toBe('person,email address')
    expect(formData.get('score_threshold')).toBe('0.8')
    expect(formData.get('policy')).toBe('gdpr_eu')
  })
})

describe('imageRedact', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should return image and metadata', async () => {
    global.fetch = mockImageFetchSuccess()
    const result = await client.imageRedact(Buffer.from('img'))
    expect(result.image).toBeInstanceOf(ArrayBuffer)
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /file/redact', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageRedact(Buffer.from('img'))
    expect(getFetchUrl(global.fetch as jest.Mock)).toContain('/file/redact')
  })
})

describe('imageMask', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should return image', async () => {
    global.fetch = mockImageFetchSuccess()
    const result = await client.imageMask(Buffer.from('img'))
    expect(result.image).toBeInstanceOf(ArrayBuffer)
  })

  test('should send mask params', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageMask(Buffer.from('img'), {
      chars_to_show: 5,
      from_end: true,
      masking_char: '#',
    })
    const formData = getFetchFormData(global.fetch as jest.Mock)
    expect(formData.get('chars_to_show')).toBe('5')
    expect(formData.get('from_end')).toBe('true')
    expect(formData.get('masking_char')).toBe('#')
  })

  test('should send POST to /file/mask', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageMask(Buffer.from('img'))
    expect(getFetchUrl(global.fetch as jest.Mock)).toContain('/file/mask')
  })
})

describe('imageSynthesize', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should return image', async () => {
    global.fetch = mockImageFetchSuccess()
    const result = await client.imageSynthesize(Buffer.from('img'))
    expect(result.image).toBeInstanceOf(ArrayBuffer)
  })

  test('should send synthesis_language', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageSynthesize(Buffer.from('img'), { synthesis_language: 'de' })
    const formData = getFetchFormData(global.fetch as jest.Mock)
    expect(formData.get('synthesis_language')).toBe('de')
  })

  test('should send POST to /file/synthesize', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageSynthesize(Buffer.from('img'))
    expect(getFetchUrl(global.fetch as jest.Mock)).toContain('/file/synthesize')
  })
})

describe('imageHash', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should return image', async () => {
    global.fetch = mockImageFetchSuccess()
    const result = await client.imageHash(Buffer.from('img'))
    expect(result.image).toBeInstanceOf(ArrayBuffer)
  })

  test('should send hash params', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageHash(Buffer.from('img'), {
      hash_type: 'md5',
      hash_prefix: 'H_',
      hash_length: 8,
    })
    const formData = getFetchFormData(global.fetch as jest.Mock)
    expect(formData.get('hash_type')).toBe('md5')
    expect(formData.get('hash_prefix')).toBe('H_')
    expect(formData.get('hash_length')).toBe('8')
  })

  test('should send POST to /file/hash', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageHash(Buffer.from('img'))
    expect(getFetchUrl(global.fetch as jest.Mock)).toContain('/file/hash')
  })
})

describe('imageEncrypt', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should return image', async () => {
    global.fetch = mockImageFetchSuccess()
    const result = await client.imageEncrypt(Buffer.from('img'))
    expect(result.image).toBeInstanceOf(ArrayBuffer)
  })

  test('should send encryption_key', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageEncrypt(Buffer.from('img'), { encryption_key: 'my-secret-key-1234' })
    const formData = getFetchFormData(global.fetch as jest.Mock)
    expect(formData.get('encryption_key')).toBe('my-secret-key-1234')
  })

  test('should not send encryption_key when not provided', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageEncrypt(Buffer.from('img'))
    const formData = getFetchFormData(global.fetch as jest.Mock)
    expect(formData.get('encryption_key')).toBeNull()
  })

  test('should send POST to /file/encrypt', async () => {
    global.fetch = mockImageFetchSuccess()
    await client.imageEncrypt(Buffer.from('img'))
    expect(getFetchUrl(global.fetch as jest.Mock)).toContain('/file/encrypt')
  })
})

describe('image process metadata parsing', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should handle no entities', async () => {
    global.fetch = mockImageFetchSuccess({ entities: [], mapping: {}, ocrConfidence: 90.0 })
    const result = await client.imageTokenize(Buffer.from('img'))
    expect(result.entities_count).toBe(0)
    expect(result.detected_entities).toEqual([])
    expect(result.mapping).toEqual({})
  })

  test('should handle null confidence', async () => {
    global.fetch = mockImageFetchSuccess({ ocrConfidence: null })
    const result = await client.imageTokenize(Buffer.from('img'))
    expect(result.ocr_confidence).toBeNull()
  })
})

describe('image process auth error', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should throw AuthenticationError on 401', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ detail: 'Unauthorized' }),
    })

    await expect(client.imageTokenize(Buffer.from('img'))).rejects.toThrow(
      'Authentication failed'
    )
  })
})
