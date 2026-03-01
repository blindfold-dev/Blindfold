// Base detector classes inspired by scrubadub's architecture

import { EntityType, PIIMatch } from './entities'

/** Base class for all PII detectors. */
export abstract class Detector {
  abstract entityType: EntityType
  score = 0.85
  baseScore: number | null = null // score when no context found (null = backward compat)
  contextKeywords: string[] = []
  contextRequired = false
  contextWindow = 50
  locale = ''
  needsDigit = true

  abstract iterMatches(text: string): PIIMatch[]

  /** Check if any context keyword appears near the match position. */
  protected hasContext(text: string, start: number, end: number = 0): boolean {
    if (this.contextKeywords.length === 0) {
      return true
    }
    const lower = (this as any)._textLower || text.toLowerCase()
    const windowStart = Math.max(0, start - this.contextWindow)
    const before = lower.slice(windowStart, start)
    const after = end ? lower.slice(end, end + this.contextWindow) : ''
    const window = before + ' ' + after
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

      const hasCtx = this.hasContext(text, start, end)

      if (this.contextRequired && !hasCtx) {
        continue
      }

      let score: number
      if (this.validator) {
        if (!this.validator(matchedText)) {
          continue
        }
        score = hasCtx ? 1.0 : this.score
      } else {
        if (hasCtx) {
          score = this.score
        } else {
          score = this.baseScore !== null ? this.baseScore : this.score
        }
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
