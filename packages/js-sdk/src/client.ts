import type {
  BlindfoldConfig,
  DetectConfig,
  DetectResponse,
  TokenizeConfig,
  TokenizeResponse,
  DetokenizeResponse,
  RedactConfig,
  RedactResponse,
  MaskConfig,
  MaskResponse,
  SynthesizeConfig,
  SynthesizeResponse,
  HashConfig,
  HashResponse,
  EncryptConfig,
  EncryptResponse,
  ImageDetectConfig,
  ImageDetectResponse,
  ImageProcessConfig,
  ImageMaskConfig,
  ImageSynthesizeConfig,
  ImageHashConfig,
  ImageEncryptConfig,
  ImageProcessResponse,
  BatchResponse,
  APIErrorResponse,
} from './types'
import { AuthenticationError, APIError, NetworkError } from './errors'

const DEFAULT_BASE_URL = 'https://api.blindfold.dev/api/public/v1'
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])

const REGION_URLS: Record<string, string> = {
  eu: 'https://eu-api.blindfold.dev/api/public/v1',
  us: 'https://us-api.blindfold.dev/api/public/v1',
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Blindfold client for tokenization and detokenization
 */
export class Blindfold {
  private apiKey: string
  private baseUrl: string
  private userId?: string
  private maxRetries: number
  private retryDelay: number

  /**
   * Create a new Blindfold client
   * @param config - Configuration options
   */
  constructor(config: BlindfoldConfig) {
    this.apiKey = config.apiKey
    if (config.region && !config.baseUrl) {
      const regionUrl = REGION_URLS[config.region]
      if (!regionUrl) {
        throw new Error(`Invalid region '${config.region}'. Must be one of: ${Object.keys(REGION_URLS).join(', ')}`)
      }
      this.baseUrl = regionUrl
    } else {
      this.baseUrl = config.baseUrl || DEFAULT_BASE_URL
    }
    this.userId = config.userId
    this.maxRetries = config.maxRetries ?? 2
    this.retryDelay = config.retryDelay ?? 0.5
  }

  private retryWait(attempt: number, error?: APIError): number {
    if (error && error.statusCode === 429) {
      const body = error.responseBody as Record<string, unknown> | undefined
      if (body && typeof body.retry_after === 'number') {
        return body.retry_after * 1000
      }
    }
    const delay = this.retryDelay * (2 ** attempt) * 1000
    const jitter = delay * 0.1 * Math.random()
    return delay + jitter
  }

  /**
   * Make an authenticated request to the API
   */
  private async request<T>(
    endpoint: string,
    method: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    }

    if (this.userId) {
      headers['X-Blindfold-User-Id'] = this.userId
    }

    let lastError: Error = new NetworkError('Request failed')

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        })

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError('Authentication failed. Please check your API key.')
        }

        // Handle other error responses
        if (!response.ok) {
          let errorMessage = `API request failed with status ${response.status}`
          let responseBody: unknown

          try {
            responseBody = await response.json()
            const errorData = responseBody as APIErrorResponse
            errorMessage = errorData.detail || errorData.message || errorMessage
          } catch {
            // If we can't parse the error response, use the status text
            errorMessage = `${errorMessage}: ${response.statusText}`
          }

          throw new APIError(errorMessage, response.status, responseBody)
        }

        return (await response.json()) as T
      } catch (error) {
        // Never retry auth errors
        if (error instanceof AuthenticationError) {
          throw error
        }

        // Retry retryable API errors
        if (error instanceof APIError) {
          if (RETRYABLE_STATUS_CODES.has(error.statusCode) && attempt < this.maxRetries) {
            await sleep(this.retryWait(attempt, error))
            continue
          }
          throw error
        }

        // Retry network errors
        if (error instanceof NetworkError) {
          lastError = error
          if (attempt < this.maxRetries) {
            await sleep(this.retryWait(attempt))
            continue
          }
          throw error
        }

        // Handle raw fetch errors (network failures)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new NetworkError(
            'Network request failed. Please check your connection and the API URL.'
          )
          if (attempt < this.maxRetries) {
            await sleep(this.retryWait(attempt))
            continue
          }
          throw lastError
        }

        // Non-retryable unknown errors
        throw new NetworkError(error instanceof Error ? error.message : 'Unknown error occurred')
      }
    }

    throw lastError
  }

  /**
   * Tokenize text by replacing sensitive information with tokens
   * @param text - Text to tokenize
   * @param config - Optional configuration
   * @returns Promise with tokenized text and mapping
   */
  async tokenize(text: string, config?: TokenizeConfig): Promise<TokenizeResponse> {
    return this.request<TokenizeResponse>('/tokenize', 'POST', {
      text,
      ...config,
    })
  }

  /**
   * Detect PII in text without modifying it
   *
   * Returns only the detected entities with their types, positions,
   * and confidence scores. The original text is not transformed.
   *
   * @param text - Text to analyze for PII
   * @param config - Optional configuration (entities, score_threshold, policy)
   * @returns Promise with detected entities
   */
  async detect(text: string, config?: DetectConfig): Promise<DetectResponse> {
    return this.request<DetectResponse>('/detect', 'POST', {
      text,
      ...config,
    })
  }

  /**
   * Detokenize text by replacing tokens with original values
   *
   * This method performs detokenization CLIENT-SIDE for better performance,
   * security, and to work offline. No API call is made.
   *
   * @param text - Tokenized text
   * @param mapping - Token mapping from tokenize response
   * @returns DetokenizeResponse with original text
   */
  detokenize(text: string, mapping: Record<string, string>): DetokenizeResponse {
    let result = text
    let replacements = 0

    // Sort tokens by length (longest first) to avoid partial replacements
    const sortedTokens = Object.keys(mapping).sort((a, b) => b.length - a.length)

    for (const token of sortedTokens) {
      const originalValue = mapping[token]
      const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const matches = result.match(regex)

      if (matches) {
        result = result.replace(regex, originalValue)
        replacements += matches.length
      }
    }

    return {
      text: result,
      replacements_made: replacements,
    }
  }

  /**
   * Redact (permanently remove) sensitive information from text
   *
   * WARNING: Redaction is irreversible - original data cannot be restored!
   *
   * @param text - Text to redact
   * @param config - Optional configuration (masking_char, entities)
   * @returns Promise with redacted text and detected entities
   */
  async redact(text: string, config?: RedactConfig): Promise<RedactResponse> {
    return this.request<RedactResponse>('/redact', 'POST', {
      text,
      ...config,
    })
  }

  /**
   * Mask (partially hide) sensitive information from text
   *
   * @param text - Text to mask
   * @param config - Optional configuration (chars_to_show, from_end, masking_char, entities)
   * @returns Promise with masked text and detected entities
   */
  async mask(text: string, config?: MaskConfig): Promise<MaskResponse> {
    return this.request<MaskResponse>('/mask', 'POST', {
      text,
      ...config,
    })
  }

  /**
   * Synthesize (replace real data with synthetic fake data)
   *
   * @param text - Text to synthesize
   * @param config - Optional configuration (language, entities)
   * @returns Promise with synthetic text and detected entities
   */
  async synthesize(text: string, config?: SynthesizeConfig): Promise<SynthesizeResponse> {
    return this.request<SynthesizeResponse>('/synthesize', 'POST', {
      text,
      ...config,
    })
  }

  /**
   * Hash (replace with deterministic hash values)
   *
   * @param text - Text to hash
   * @param config - Optional configuration (hash_type, hash_prefix, hash_length, entities)
   * @returns Promise with hashed text and detected entities
   */
  async hash(text: string, config?: HashConfig): Promise<HashResponse> {
    return this.request<HashResponse>('/hash', 'POST', {
      text,
      ...config,
    })
  }

  /**
   * Encrypt (reversibly protect) sensitive data in text using AES encryption
   *
   * @param text - Text to encrypt
   * @param config - Optional configuration (encryption_key, entities)
   * @returns Promise with encrypted text and detected entities
   */
  async encrypt(text: string, config?: EncryptConfig): Promise<EncryptResponse> {
    return this.request<EncryptResponse>('/encrypt', 'POST', {
      text,
      ...config,
    })
  }

  /**
   * Detect PII in an image using OCR + entity detection
   *
   * Uploads an image, extracts text via Tesseract OCR, then runs
   * PII detection on the extracted text.
   *
   * @param file - Image file as Blob (browser) or Buffer (Node.js)
   * @param config - Optional configuration (language, entities, score_threshold, policy)
   * @returns Promise with extracted text and detected entities
   */
  async imageDetect(file: Blob | Buffer, config?: ImageDetectConfig): Promise<ImageDetectResponse> {
    const url = `${this.baseUrl}/file/detect`

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
    }

    if (this.userId) {
      headers['X-Blindfold-User-Id'] = this.userId
    }

    const formData = new FormData()
    if (file instanceof Blob) {
      formData.append('file', file)
    } else {
      // Node.js Buffer
      formData.append('file', new Blob([file]), 'image.png')
    }

    formData.append('language', config?.language ?? 'eng')
    if (config?.entities) {
      formData.append('entities', config.entities.join(','))
    }
    if (config?.score_threshold !== undefined) {
      formData.append('score_threshold', String(config.score_threshold))
    }
    if (config?.policy) {
      formData.append('policy', config.policy)
    }

    let lastError: Error = new NetworkError('Request failed')

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: formData,
        })

        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError('Authentication failed. Please check your API key.')
        }

        if (!response.ok) {
          let errorMessage = `API request failed with status ${response.status}`
          let responseBody: unknown

          try {
            responseBody = await response.json()
            const errorData = responseBody as APIErrorResponse
            errorMessage = errorData.detail || errorData.message || errorMessage
          } catch {
            errorMessage = `${errorMessage}: ${response.statusText}`
          }

          throw new APIError(errorMessage, response.status, responseBody)
        }

        return (await response.json()) as ImageDetectResponse
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error
        }

        if (error instanceof APIError) {
          if (RETRYABLE_STATUS_CODES.has(error.statusCode) && attempt < this.maxRetries) {
            await sleep(this.retryWait(attempt, error))
            continue
          }
          throw error
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new NetworkError(
            'Network request failed. Please check your connection and the API URL.'
          )
          if (attempt < this.maxRetries) {
            await sleep(this.retryWait(attempt))
            continue
          }
          throw lastError
        }

        throw new NetworkError(error instanceof Error ? error.message : 'Unknown error occurred')
      }
    }

    throw lastError
  }

  // ===== Image processing methods =====

  /**
   * Send a multipart image processing request that returns binary PNG + metadata headers.
   */
  private async imageProcessRequest(
    endpoint: string,
    file: Blob | Buffer,
    formFields: Record<string, string>,
  ): Promise<ImageProcessResponse> {
    const url = `${this.baseUrl}/file/${endpoint}`

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
    }

    if (this.userId) {
      headers['X-Blindfold-User-Id'] = this.userId
    }

    const formData = new FormData()
    if (file instanceof Blob) {
      formData.append('file', file)
    } else {
      // Node.js Buffer
      formData.append('file', new Blob([file]), 'image.png')
    }

    for (const [key, value] of Object.entries(formFields)) {
      formData.append(key, value)
    }

    let lastError: Error = new NetworkError('Request failed')

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: formData,
        })

        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError('Authentication failed. Please check your API key.')
        }

        if (!response.ok) {
          let errorMessage = `API request failed with status ${response.status}`
          let responseBody: unknown

          try {
            responseBody = await response.json()
            const errorData = responseBody as APIErrorResponse
            errorMessage = errorData.detail || errorData.message || errorMessage
          } catch {
            errorMessage = `${errorMessage}: ${response.statusText}`
          }

          throw new APIError(errorMessage, response.status, responseBody)
        }

        const contentType = response.headers.get('content-type') || ''
        if (contentType.startsWith('image/')) {
          const imageBuffer = await response.arrayBuffer()

          const entitiesRaw = response.headers.get('x-detected-entities') || '[]'
          const mappingRaw = response.headers.get('x-mapping') || '{}'
          const confidenceRaw = response.headers.get('x-ocr-confidence') || ''

          let detectedEntities = []
          try { detectedEntities = JSON.parse(entitiesRaw) } catch { /* empty */ }
          let mapping: Record<string, string> = {}
          try { mapping = JSON.parse(mappingRaw) } catch { /* empty */ }

          return {
            image: imageBuffer,
            detected_entities: detectedEntities,
            entities_count: parseInt(response.headers.get('x-entities-count') || '0', 10),
            mapping,
            ocr_confidence: confidenceRaw ? parseFloat(confidenceRaw) : null,
          }
        }

        // Fallback: JSON response
        const data = (await response.json()) as Record<string, unknown>
        return {
          image: new ArrayBuffer(0),
          detected_entities: (data.detected_entities || []) as ImageProcessResponse['detected_entities'],
          entities_count: (data.entities_count || 0) as number,
          mapping: (data.mapping || {}) as Record<string, string>,
          ocr_confidence: (data.ocr_confidence ?? null) as number | null,
        }
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error
        }

        if (error instanceof APIError) {
          if (RETRYABLE_STATUS_CODES.has(error.statusCode) && attempt < this.maxRetries) {
            await sleep(this.retryWait(attempt, error))
            continue
          }
          throw error
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new NetworkError(
            'Network request failed. Please check your connection and the API URL.'
          )
          if (attempt < this.maxRetries) {
            await sleep(this.retryWait(attempt))
            continue
          }
          throw lastError
        }

        throw new NetworkError(error instanceof Error ? error.message : 'Unknown error occurred')
      }
    }

    throw lastError
  }

  /**
   * Build form fields for image processing from a config object.
   */
  private buildImageFormFields(config?: ImageProcessConfig, extra?: Record<string, string>): Record<string, string> {
    const fields: Record<string, string> = {
      language: config?.language ?? 'eng',
    }
    if (config?.entities) {
      fields.entities = config.entities.join(',')
    }
    if (config?.score_threshold !== undefined) {
      fields.score_threshold = String(config.score_threshold)
    }
    if (config?.policy) {
      fields.policy = config.policy
    }
    if (extra) {
      Object.assign(fields, extra)
    }
    return fields
  }

  /**
   * Tokenize PII in an image. Returns a PNG with PII replaced by token labels.
   *
   * @param file - Image file as Blob (browser) or Buffer (Node.js)
   * @param config - Optional configuration (language, entities, score_threshold, policy)
   * @returns Promise with processed image and metadata
   */
  async imageTokenize(file: Blob | Buffer, config?: ImageProcessConfig): Promise<ImageProcessResponse> {
    return this.imageProcessRequest('tokenize', file, this.buildImageFormFields(config))
  }

  /**
   * Redact PII in an image. Returns a PNG with PII covered by black boxes.
   *
   * @param file - Image file as Blob (browser) or Buffer (Node.js)
   * @param config - Optional configuration (language, entities, score_threshold, policy)
   * @returns Promise with processed image and metadata
   */
  async imageRedact(file: Blob | Buffer, config?: ImageProcessConfig): Promise<ImageProcessResponse> {
    return this.imageProcessRequest('redact', file, this.buildImageFormFields(config))
  }

  /**
   * Mask PII in an image. Returns a PNG with PII partially masked.
   *
   * @param file - Image file as Blob (browser) or Buffer (Node.js)
   * @param config - Optional configuration including masking parameters
   * @returns Promise with processed image and metadata
   */
  async imageMask(file: Blob | Buffer, config?: ImageMaskConfig): Promise<ImageProcessResponse> {
    const extra: Record<string, string> = {}
    if (config?.chars_to_show !== undefined) extra.chars_to_show = String(config.chars_to_show)
    if (config?.from_end) extra.from_end = 'true'
    if (config?.masking_char) extra.masking_char = config.masking_char
    return this.imageProcessRequest('mask', file, this.buildImageFormFields(config, extra))
  }

  /**
   * Synthesize PII in an image. Returns a PNG with PII replaced by realistic fake data.
   *
   * @param file - Image file as Blob (browser) or Buffer (Node.js)
   * @param config - Optional configuration including synthesis language
   * @returns Promise with processed image and metadata
   */
  async imageSynthesize(file: Blob | Buffer, config?: ImageSynthesizeConfig): Promise<ImageProcessResponse> {
    const extra: Record<string, string> = {}
    if (config?.synthesis_language) extra.synthesis_language = config.synthesis_language
    return this.imageProcessRequest('synthesize', file, this.buildImageFormFields(config, extra))
  }

  /**
   * Hash PII in an image. Returns a PNG with PII replaced by deterministic hash values.
   *
   * @param file - Image file as Blob (browser) or Buffer (Node.js)
   * @param config - Optional configuration including hash parameters
   * @returns Promise with processed image and metadata
   */
  async imageHash(file: Blob | Buffer, config?: ImageHashConfig): Promise<ImageProcessResponse> {
    const extra: Record<string, string> = {}
    if (config?.hash_type) extra.hash_type = config.hash_type
    if (config?.hash_prefix !== undefined) extra.hash_prefix = config.hash_prefix
    if (config?.hash_length !== undefined) extra.hash_length = String(config.hash_length)
    return this.imageProcessRequest('hash', file, this.buildImageFormFields(config, extra))
  }

  /**
   * Encrypt PII in an image. Returns a PNG with PII replaced by encrypted values.
   *
   * @param file - Image file as Blob (browser) or Buffer (Node.js)
   * @param config - Optional configuration including encryption key
   * @returns Promise with processed image and metadata
   */
  async imageEncrypt(file: Blob | Buffer, config?: ImageEncryptConfig): Promise<ImageProcessResponse> {
    const extra: Record<string, string> = {}
    if (config?.encryption_key) extra.encryption_key = config.encryption_key
    return this.imageProcessRequest('encrypt', file, this.buildImageFormFields(config, extra))
  }

  // ===== Batch methods =====

  /**
   * Tokenize multiple texts in a single request
   * @param texts - Array of texts to tokenize (max 100)
   * @param config - Optional configuration
   * @returns Promise with batch results
   */
  async tokenizeBatch(texts: string[], config?: TokenizeConfig): Promise<BatchResponse> {
    return this.request<BatchResponse>('/tokenize', 'POST', {
      texts,
      ...config,
    })
  }

  /**
   * Detect PII in multiple texts in a single request
   * @param texts - Array of texts to analyze (max 100)
   * @param config - Optional configuration
   * @returns Promise with batch results
   */
  async detectBatch(texts: string[], config?: DetectConfig): Promise<BatchResponse> {
    return this.request<BatchResponse>('/detect', 'POST', {
      texts,
      ...config,
    })
  }

  /**
   * Redact PII from multiple texts in a single request
   * @param texts - Array of texts to redact (max 100)
   * @param config - Optional configuration
   * @returns Promise with batch results
   */
  async redactBatch(texts: string[], config?: RedactConfig): Promise<BatchResponse> {
    return this.request<BatchResponse>('/redact', 'POST', {
      texts,
      ...config,
    })
  }

  /**
   * Mask PII in multiple texts in a single request
   * @param texts - Array of texts to mask (max 100)
   * @param config - Optional configuration
   * @returns Promise with batch results
   */
  async maskBatch(texts: string[], config?: MaskConfig): Promise<BatchResponse> {
    return this.request<BatchResponse>('/mask', 'POST', {
      texts,
      ...config,
    })
  }

  /**
   * Synthesize multiple texts in a single request
   * @param texts - Array of texts to synthesize (max 100)
   * @param config - Optional configuration
   * @returns Promise with batch results
   */
  async synthesizeBatch(texts: string[], config?: SynthesizeConfig): Promise<BatchResponse> {
    return this.request<BatchResponse>('/synthesize', 'POST', {
      texts,
      ...config,
    })
  }

  /**
   * Hash PII in multiple texts in a single request
   * @param texts - Array of texts to hash (max 100)
   * @param config - Optional configuration
   * @returns Promise with batch results
   */
  async hashBatch(texts: string[], config?: HashConfig): Promise<BatchResponse> {
    return this.request<BatchResponse>('/hash', 'POST', {
      texts,
      ...config,
    })
  }

  /**
   * Encrypt PII in multiple texts in a single request
   * @param texts - Array of texts to encrypt (max 100)
   * @param config - Optional configuration
   * @returns Promise with batch results
   */
  async encryptBatch(texts: string[], config?: EncryptConfig): Promise<BatchResponse> {
    return this.request<BatchResponse>('/encrypt', 'POST', {
      texts,
      ...config,
    })
  }
}
