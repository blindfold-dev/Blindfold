// Base detector classes inspired by scrubadub's architecture

import { EntityType, PIIMatch } from './entities'

/** Base class for all PII detectors. */
export abstract class Detector {
  abstract entityType: EntityType
  score = 0.85
  contextKeywords: string[] = []
  contextRequired = false
  contextWindow = 50
  locale = ''

  abstract iterMatches(text: string): PIIMatch[]

  /** Check if any context keyword appears near the match position. */
  protected hasContext(text: string, start: number): boolean {
    if (this.contextKeywords.length === 0) {
      return true
    }
    const windowStart = Math.max(0, start - this.contextWindow)
    const window = text.slice(windowStart, start).toLowerCase()
    return this.contextKeywords.some((kw) => window.includes(kw))
  }
}

/** Detector using a single regex pattern with optional validation. */
export abstract class RegexDetector extends Detector {
  abstract pattern: RegExp
  validator?: (text: string) => boolean

  /** Optional fast pre-check before running regex. Override in subclasses. */
  preCheck(_text: string): boolean {
    return true
  }

  iterMatches(text: string): PIIMatch[] {
    if (!this.preCheck(text)) {
      return []
    }

    const results: PIIMatch[] = []
    // Reset lastIndex for stateful /g patterns
    this.pattern.lastIndex = 0

    let match: RegExpExecArray | null
    while ((match = this.pattern.exec(text)) !== null) {
      const matchedText = match[0]
      const start = match.index
      const end = start + matchedText.length

      if (this.contextRequired && !this.hasContext(text, start)) {
        continue
      }

      let score = this.score
      if (this.validator) {
        if (!this.validator(matchedText)) {
          continue
        }
        score = 1.0
      } else if (this.contextKeywords.length > 0 && this.hasContext(text, start)) {
        score = Math.min(score + 0.05, 0.95)
      }

      results.push({
        entityType: this.entityType,
        text: matchedText,
        start,
        end,
        score,
      })
    }
    return results
  }
}
