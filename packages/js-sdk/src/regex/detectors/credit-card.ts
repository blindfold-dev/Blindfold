// Credit card number detector with Luhn validation

import { Detector } from '../base'
import { EntityType, PIIMatch } from '../entities'
import { registerUniversal } from '../registry'
import { luhnChecksum } from '../validators'

// Known IIN prefix patterns (no context needed)
const CC_KNOWN = new RegExp(
  '\\b(?:' +
    // Visa: 13, 16, or 19 digits
    '4\\d{3}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}(?:[-\\s]?\\d{3})?' +
    '|4\\d{12}' +
    // Mastercard: 5[1-5]xx or 2[2-7]xx (16 digits)
    '|5[1-5]\\d{2}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}' +
    '|2[2-7]\\d{2}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}' +
    // Amex: 34xx or 37xx (15 digits)
    '|3[47]\\d{2}[-\\s]?\\d{6}[-\\s]?\\d{5}' +
    // Discover: 6011 or 65xx (16 digits)
    '|6(?:011|5\\d{2})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}' +
    // Diners Club: 300-305, 36, 38 (14-16 digits)
    '|3(?:0[0-5]|[68]\\d)\\d{11,13}' +
    // JCB: 3528-3589 (16 digits)
    '|35(?:2[89]|[3-8]\\d)\\d{12}' +
    // UnionPay: 62xx (16-19 digits)
    '|62\\d{14,17}' +
    // Maestro: 5018, 5020, 5038, 6304, 6759, 6761-6763 (12-19 digits)
    '|50(?:18|20|38)\\d{8,15}' +
    '|6(?:304|7(?:59|6[1-3]))\\d{8,15}' +
    ')\\b',
  'g'
)

// Generic long number pattern (context required, for unknown IIN prefixes)
const CC_GENERIC = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b/g

const CC_CONTEXT = [
  'credit card', 'card number', 'card no', 'card #',
  'cc:', 'cc #', 'payment card', 'debit card',
  'billing', 'card:', 'credit', 'payment',
]

class CreditCardDetector extends Detector {
  entityType = EntityType.CREDIT_CARD
  score = 0.9

  iterMatches(text: string): PIIMatch[] {
    if (!text.match(/\d/)) return []

    const results: PIIMatch[] = []

    // Branch 1: Known IIN prefixes (no context needed)
    CC_KNOWN.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = CC_KNOWN.exec(text)) !== null) {
      const matchedText = match[0]
      if (!luhnChecksum(matchedText)) continue
      results.push({
        entityType: this.entityType,
        text: matchedText,
        start: match.index,
        end: match.index + matchedText.length,
        score: 1.0,
      })
    }

    // Branch 2: Generic long numbers with context + Luhn (unknown IIN)
    CC_GENERIC.lastIndex = 0
    while ((match = CC_GENERIC.exec(text)) !== null) {
      const matchedText = match[0]
      const start = match.index
      // Skip if overlaps with known pattern match
      if (results.some((r) => r.start <= start && start < r.end)) continue
      if (!luhnChecksum(matchedText)) continue
      // Require CC context keywords
      const windowStart = Math.max(0, start - 100)
      const window = text.slice(windowStart, start).toLowerCase()
      if (!CC_CONTEXT.some((kw) => window.includes(kw))) continue
      results.push({
        entityType: this.entityType,
        text: matchedText,
        start,
        end: start + matchedText.length,
        score: 1.0,
      })
    }

    return results
  }
}

registerUniversal(CreditCardDetector)

export { CreditCardDetector }
