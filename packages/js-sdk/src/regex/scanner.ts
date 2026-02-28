// PIIScanner: orchestrates detectors, deduplicates results, produces output

import * as crypto from 'crypto'
import { EntityType, PIIMatch } from './entities'
import { DetectorRegistry } from './registry'
import { synthesizeValue } from './synthesizers'

// Force import of all detectors so they auto-register
import './detectors/index'

export interface PIIScannerOptions {
  /** List of locale codes to enable (default: ["us"]). */
  locales?: string[]
}

export interface TokenizeResult {
  text: string
  mapping: Record<string, string>
  matches: PIIMatch[]
}

export interface MaskResult {
  text: string
  matches: PIIMatch[]
}

export interface HashResult {
  text: string
  matches: PIIMatch[]
}

export interface EncryptResult {
  text: string
  matches: PIIMatch[]
}

export interface SynthesizeResult {
  text: string
  matches: PIIMatch[]
}

/**
 * Local regex-based PII scanner.
 *
 * Usage:
 *   const scanner = new PIIScanner({ locales: ['us', 'eu'] })
 *   const matches = scanner.detect('Email john@acme.com, SSN 123-45-6789')
 *   const [redacted, matches] = scanner.redact('Email john@acme.com')
 */
export class PIIScanner {
  private registry: DetectorRegistry

  constructor(options?: PIIScannerOptions) {
    this.registry = new DetectorRegistry(options?.locales)
  }

  /** Detect PII entities in text and return deduplicated matches. */
  detect(text: string, entities?: string[]): PIIMatch[] {
    let detectors = this.registry.detectors
    if (entities) {
      const entitySet = new Set(entities)
      detectors = detectors.filter((d) => entitySet.has(d.entityType))
    }
    const hasDigit = /\d/.test(text)
    const textLower = text.toLowerCase()
    const allMatches: PIIMatch[] = []
    for (const detector of detectors) {
      if (detector.needsDigit && !hasDigit) {
        continue
      }
      ;(detector as any)._textLower = textLower
      allMatches.push(...detector.iterMatches(text))
      ;(detector as any)._textLower = null
    }
    return this.deduplicate(allMatches)
  }

  /**
   * Detect and remove PII from text.
   * Returns a tuple of [redactedText, detectedMatches].
   */
  redact(text: string, entities?: string[]): [string, PIIMatch[]] {
    const matches = this.detect(text, entities)
    if (matches.length === 0) {
      return [text, []]
    }

    // Sort by start position descending so replacements do not shift indices
    const sortedMatches = [...matches].sort((a, b) => b.start - a.start)
    let result = text
    for (const m of sortedMatches) {
      // Also consume a preceding space to keep output clean
      const start = m.start > 0 && result[m.start - 1] === ' ' ? m.start - 1 : m.start
      result = result.slice(0, start) + result.slice(m.end)
    }

    return [result, matches]
  }

  /**
   * Detect PII and replace with numbered tokens like `<Email Address_1>`.
   * Returns tokenized text, a mapping from tokens to original values, and matches.
   */
  tokenize(text: string, entities?: string[]): TokenizeResult {
    const matches = this.detect(text, entities)
    if (matches.length === 0) {
      return { text, mapping: {}, matches: [] }
    }

    // Assign per-type counters in reading order (ascending start position)
    const sortedAsc = [...matches].sort((a, b) => a.start - b.start)
    const counters: Record<string, number> = {}
    const tokenMap: Map<PIIMatch, string> = new Map()
    const mapping: Record<string, string> = {}

    for (const m of sortedAsc) {
      const count = (counters[m.entityType] ?? 0) + 1
      counters[m.entityType] = count
      const token = `<${m.entityType}_${count}>`
      tokenMap.set(m, token)
      mapping[token] = m.text
    }

    // Replace in descending position order
    const sortedDesc = [...matches].sort((a, b) => b.start - a.start)
    let result = text
    for (const m of sortedDesc) {
      const token = tokenMap.get(m)!
      result = result.slice(0, m.start) + token + result.slice(m.end)
    }

    return { text: result, mapping, matches }
  }

  /**
   * Detect PII and partially mask each match.
   */
  mask(
    text: string,
    charsToShow: number = 3,
    fromEnd: boolean = false,
    maskingChar: string = '*',
    entities?: string[]
  ): MaskResult {
    const matches = this.detect(text, entities)
    if (matches.length === 0) {
      return { text, matches: [] }
    }

    const sortedMatches = [...matches].sort((a, b) => b.start - a.start)
    let result = text
    for (const m of sortedMatches) {
      const original = m.text
      const show = Math.min(charsToShow, original.length)
      const maskLen = original.length - show
      let masked: string
      if (fromEnd) {
        masked = maskingChar.repeat(maskLen) + original.slice(maskLen)
      } else {
        masked = original.slice(0, show) + maskingChar.repeat(maskLen)
      }
      result = result.slice(0, m.start) + masked + result.slice(m.end)
    }

    return { text: result, matches }
  }

  /**
   * Detect PII and replace each match with a deterministic hash.
   */
  hash(
    text: string,
    hashType: string = 'sha256',
    hashPrefix: string = 'HASH_',
    hashLength: number = 16,
    entities?: string[]
  ): HashResult {
    const matches = this.detect(text, entities)
    if (matches.length === 0) {
      return { text, matches: [] }
    }

    const sortedMatches = [...matches].sort((a, b) => b.start - a.start)
    let result = text
    for (const m of sortedMatches) {
      const digest = crypto.createHash(hashType).update(m.text).digest('hex')
      const truncated = digest.slice(0, hashLength)
      const replacement = hashPrefix + truncated
      result = result.slice(0, m.start) + replacement + result.slice(m.end)
    }

    return { text: result, matches }
  }

  /**
   * Detect PII and encrypt each match with AES-256-CBC.
   * @param encryptionKey - Required, minimum 16 characters.
   */
  encrypt(text: string, encryptionKey: string, entities?: string[]): EncryptResult {
    if (!encryptionKey || encryptionKey.length < 16) {
      throw new Error('encryptionKey is required and must be at least 16 characters for local encryption')
    }

    const matches = this.detect(text, entities)
    if (matches.length === 0) {
      return { text, matches: [] }
    }

    // Derive a 32-byte key from the provided key using SHA-256
    const derivedKey = crypto.createHash('sha256').update(encryptionKey).digest()

    const sortedMatches = [...matches].sort((a, b) => b.start - a.start)
    let result = text
    for (const m of sortedMatches) {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv)
      const encrypted = Buffer.concat([cipher.update(m.text, 'utf8'), cipher.final()])
      const combined = Buffer.concat([iv, encrypted])
      const replacement = combined.toString('base64')
      result = result.slice(0, m.start) + replacement + result.slice(m.end)
    }

    return { text: result, matches }
  }

  /**
   * Detect PII and replace each match with format-preserving synthetic data.
   * @param _language - Accepted for API compatibility but ignored locally.
   */
  synthesize(text: string, _language?: string, entities?: string[]): SynthesizeResult {
    const matches = this.detect(text, entities)
    if (matches.length === 0) {
      return { text, matches: [] }
    }

    const sortedMatches = [...matches].sort((a, b) => b.start - a.start)
    let result = text
    for (const m of sortedMatches) {
      const replacement = synthesizeValue(m.entityType, m.text)
      result = result.slice(0, m.start) + replacement + result.slice(m.end)
    }

    return { text: result, matches }
  }

  /** Remove overlapping matches, preferring higher score then longer span. */
  private deduplicate(matches: PIIMatch[]): PIIMatch[] {
    if (matches.length === 0) {
      return []
    }
    // Sort by start ascending, then by score descending, then span length descending
    matches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start
      if (a.score !== b.score) return b.score - a.score
      return b.end - b.start - (a.end - a.start)
    })
    const result: PIIMatch[] = []
    let lastEnd = -1
    for (const m of matches) {
      if (m.start >= lastEnd) {
        result.push(m)
        lastEnd = m.end
      }
    }
    return result
  }
}
