/**
 * Configuration for Blindfold client
 */
export interface BlindfoldConfig {
  /** API key for authentication */
  apiKey: string
  /** Base URL for the API (default: https://api.blindfold.dev/api/public/v1) */
  baseUrl?: string
  /** Optional user ID to track who is making the request */
  userId?: string
  /** Maximum number of retries on transient errors (default: 2, 0 to disable) */
  maxRetries?: number
  /** Initial delay in seconds before first retry (default: 0.5) */
  retryDelay?: number
}

/**
 * Configuration options for tokenization
 */
export interface TokenizeConfig {
  /** List of entities to detect */
  entities?: string[]
  /** Minimum confidence score for entity detection (0.0-1.0) */
  score_threshold?: number
  /** Policy name to use for detection configuration (e.g., 'gdpr_eu', 'hipaa_us', 'basic') */
  policy?: string
}

/**
 * Configuration options for detection (no text transformation)
 */
export interface DetectConfig {
  /** List of entities to detect */
  entities?: string[]
  /** Minimum confidence score for entity detection (0.0-1.0) */
  score_threshold?: number
  /** Policy name to use for detection configuration (e.g., 'gdpr_eu', 'hipaa_us', 'basic') */
  policy?: string
}

/**
 * Response from detect endpoint
 */
export interface DetectResponse {
  /** List of detected entities */
  detected_entities: DetectedEntity[]
  /** Count of detected entities */
  entities_count: number
}

/**
 * Detected entity information
 */
export interface DetectedEntity {
  /** Entity type (e.g., "person", "email address", "phone number") */
  entity_type: string
  /** Original text of the entity */
  text: string
  /** Start index in text */
  start: number
  /** End index in text */
  end: number
  /** Confidence score (0-1) */
  score: number
}

/**
 * Response from tokenize endpoint
 */
export interface TokenizeResponse {
  /** Anonymized text with placeholders */
  text: string
  /** Mapping of tokens to original values */
  mapping: Record<string, string>
  /** List of detected entities */
  detected_entities: DetectedEntity[]
  /** Count of detected entities */
  entities_count: number
}

/**
 * Response from detokenize endpoint
 */
export interface DetokenizeResponse {
  /** Original text with restored values */
  text: string
  /** Number of replacements made */
  replacements_made: number
}

/**
 * Configuration options for redaction
 */
export interface RedactConfig {
  /** Character(s) to use for masking (default: "*") */
  masking_char?: string
  /** List of entities to detect */
  entities?: string[]
  /** Minimum confidence score for entity detection (0.0-1.0) */
  score_threshold?: number
  /** Policy name to use for detection configuration (e.g., 'gdpr_eu', 'hipaa_us', 'basic') */
  policy?: string
}

/**
 * Response from redact endpoint
 */
export interface RedactResponse {
  /** Text with PII permanently removed */
  text: string
  /** List of detected and redacted entities */
  detected_entities: DetectedEntity[]
  /** Number of entities redacted */
  entities_count: number
}

/**
 * Configuration options for masking
 */
export interface MaskConfig {
  /** Number of characters to show (default: 3) */
  chars_to_show?: number
  /** Whether to show characters from the end (default: false) */
  from_end?: boolean
  /** Character to use for masking (default: "*") */
  masking_char?: string
  /** List of entities to detect */
  entities?: string[]
  /** Minimum confidence score for entity detection (0.0-1.0) */
  score_threshold?: number
  /** Policy name to use for detection configuration (e.g., 'gdpr_eu', 'hipaa_us', 'basic') */
  policy?: string
}

/**
 * Response from mask endpoint
 */
export interface MaskResponse {
  /** Text with PII partially masked */
  text: string
  /** List of detected and masked entities */
  detected_entities: DetectedEntity[]
  /** Number of entities masked */
  entities_count: number
}

/**
 * Configuration options for synthesis
 */
export interface SynthesizeConfig {
  /** Language code for synthetic data generation (e.g., 'en', 'cs', 'de') */
  language?: string
  /** List of entities to detect */
  entities?: string[]
  /** Minimum confidence score for entity detection (0.0-1.0) */
  score_threshold?: number
  /** Policy name to use for detection configuration (e.g., 'gdpr_eu', 'hipaa_us', 'basic') */
  policy?: string
}

/**
 * Response from synthesis endpoint
 */
export interface SynthesizeResponse {
  /** Text with synthetic fake data */
  text: string
  /** List of detected and synthesized entities */
  detected_entities: DetectedEntity[]
  /** Number of entities synthesized */
  entities_count: number
}

/**
 * Configuration options for hashing
 */
export interface HashConfig {
  /** Hash algorithm to use (e.g., 'md5', 'sha1', 'sha256', 'sha512') */
  hash_type?: string
  /** Prefix to add before hash value (default: 'HASH_') */
  hash_prefix?: string
  /** Length of hash to display (default: 16) */
  hash_length?: number
  /** List of entities to detect */
  entities?: string[]
  /** Minimum confidence score for entity detection (0.0-1.0) */
  score_threshold?: number
  /** Policy name to use for detection configuration (e.g., 'gdpr_eu', 'hipaa_us', 'basic') */
  policy?: string
}

/**
 * Response from hash endpoint
 */
export interface HashResponse {
  /** Text with PII replaced by hash values */
  text: string
  /** List of detected and hashed entities */
  detected_entities: DetectedEntity[]
  /** Number of entities hashed */
  entities_count: number
}

/**
 * Configuration options for encryption
 */
export interface EncryptConfig {
  /** Optional encryption key (if not provided, tenant key will be used) */
  encryption_key?: string
  /** List of entities to detect */
  entities?: string[]
  /** Minimum confidence score for entity detection (0.0-1.0) */
  score_threshold?: number
  /** Policy name to use for detection configuration (e.g., 'gdpr_eu', 'hipaa_us', 'basic') */
  policy?: string
}

/**
 * Response from encrypt endpoint
 */
export interface EncryptResponse {
  /** Text with PII encrypted */
  text: string
  /** List of detected and encrypted entities */
  detected_entities: DetectedEntity[]
  /** Number of entities encrypted */
  entities_count: number
}

/**
 * Error response from API
 */
export interface APIErrorResponse {
  detail?: string
  message?: string
}
