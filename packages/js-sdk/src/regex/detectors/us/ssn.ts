// US Social Security Number detector

import { Detector } from '../../base'
import { EntityType, PIIMatch } from '../../entities'
import { registerRegion } from '../../registry'
import { ssnValidFormat } from '../../validators'

// SSN with separators (dashes, spaces, or dots)
const SSN_WITH_SEP = new RegExp(
  '\\b(?!000|666|9\\d{2})\\d{3}[-.\\s](?!00)\\d{2}[-.\\s](?!0000)\\d{4}\\b',
  'g'
)

// SSN without separators (9 bare digits) — requires context to avoid noise
const SSN_NO_SEP = new RegExp(
  '\\b(?!000|666|9\\d{2})\\d{3}(?!00)\\d{2}(?!0000)\\d{4}\\b',
  'g'
)

class SsnDetector extends Detector {
  entityType = EntityType.SSN
  score = 0.85
  contextKeywords = [
    'ssn', 'social security', 'social sec', 'ss#', 'ss #',
    'social', 'tax id', 'taxpayer', 'tin',
    'social number', 'soc number', 'socialnum',
  ]
  contextRequired = false
  contextWindow = 100

  iterMatches(text: string): PIIMatch[] {
    const results: PIIMatch[] = []

    // Branch 1: SSN with separators (no context required)
    SSN_WITH_SEP.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = SSN_WITH_SEP.exec(text)) !== null) {
      const matchedText = match[0]
      if (!ssnValidFormat(matchedText)) continue
      const start = match.index
      const end = start + matchedText.length
      const hasCtx = this.hasContext(text, start, end)
      results.push({
        entityType: this.entityType,
        text: matchedText,
        start,
        end,
        score: hasCtx ? 1.0 : this.score,
      })
    }

    // Branch 2: SSN without separators (context REQUIRED)
    SSN_NO_SEP.lastIndex = 0
    while ((match = SSN_NO_SEP.exec(text)) !== null) {
      const matchedText = match[0]
      const start = match.index
      const end = start + matchedText.length
      // Skip if this overlaps with an already-found separated SSN
      if (results.some((r) => r.start <= start && start < r.end)) continue
      if (!ssnValidFormat(matchedText)) continue
      if (!this.hasContext(text, start, end)) continue
      results.push({
        entityType: this.entityType,
        text: matchedText,
        start,
        end,
        score: 1.0,
      })
    }

    return results
  }
}

registerRegion('us', SsnDetector)

export { SsnDetector }
