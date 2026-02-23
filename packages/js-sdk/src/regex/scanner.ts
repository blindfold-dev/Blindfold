// PIIScanner: orchestrates detectors, deduplicates results, produces output

import { EntityType, PIIMatch, REDACTION_LABELS } from './entities'
import { DetectorRegistry } from './registry'

// Force import of all detectors so they auto-register
import './detectors/index'

export interface PIIScannerOptions {
  /** List of locale codes to enable (default: ["us"]). */
  locales?: string[]
  /** Optional list of EntityType values to restrict detection. */
  entities?: EntityType[]
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
    let entityTypes: Set<string> | undefined
    if (options?.entities) {
      entityTypes = new Set(options.entities.map((e) => e as string))
    }
    this.registry = new DetectorRegistry(options?.locales, entityTypes)
  }

  /** Detect PII entities in text and return deduplicated matches. */
  detect(text: string): PIIMatch[] {
    const allMatches: PIIMatch[] = []
    for (const detector of this.registry.detectors) {
      allMatches.push(...detector.iterMatches(text))
    }
    return this.deduplicate(allMatches)
  }

  /**
   * Detect and replace PII with [LABEL] placeholders.
   * Returns a tuple of [redactedText, detectedMatches].
   */
  redact(text: string): [string, PIIMatch[]] {
    const matches = this.detect(text)
    if (matches.length === 0) {
      return [text, []]
    }

    // Sort by start position descending so replacements do not shift indices
    const sortedMatches = [...matches].sort((a, b) => b.start - a.start)
    let result = text
    for (const m of sortedMatches) {
      const label = REDACTION_LABELS[m.entityType] ?? m.entityType.toUpperCase()
      result = result.slice(0, m.start) + '[' + label + ']' + result.slice(m.end)
    }

    return [result, matches]
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
      return (b.end - b.start) - (a.end - a.start)
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
