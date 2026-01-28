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
  APIErrorResponse,
} from './types'
import { AuthenticationError, APIError, NetworkError } from './errors'

const DEFAULT_BASE_URL = 'https://api.blindfold.dev/api/public/v1'

/**
 * Blindfold client for tokenization and detokenization
 */
export class Blindfold {
  private apiKey: string
  private baseUrl: string
  private userId?: string

  /**
   * Create a new Blindfold client
   * @param config - Configuration options
   */
  constructor(config: BlindfoldConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL
    this.userId = config.userId
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
      // Re-throw our custom errors
      if (error instanceof AuthenticationError || error instanceof APIError) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(
          'Network request failed. Please check your connection and the API URL.'
        )
      }

      // Handle other errors
      throw new NetworkError(error instanceof Error ? error.message : 'Unknown error occurred')
    }
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
}
