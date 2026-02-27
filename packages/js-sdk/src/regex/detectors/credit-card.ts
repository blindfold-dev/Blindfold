// Credit card number detector with Luhn validation

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'
import { luhnChecksum } from '../validators'

class CreditCardDetector extends RegexDetector {
  entityType = EntityType.CREDIT_CARD
  score = 0.9
  pattern = new RegExp(
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
      // Diners Club: 300-305, 36, 38 (14 digits)
      '|3(?:0[0-5]|[68]\\d)\\d{11}' +
      // JCB: 3528-3589 (16 digits)
      '|35(?:2[89]|[3-8]\\d)\\d{12}' +
      // UnionPay: 62xx (16-19 digits)
      '|62\\d{14,17}' +
      ')\\b',
    'g'
  )
  validator = luhnChecksum

  preCheck(text: string): boolean {
    for (const c of text) {
      if (c >= '0' && c <= '9') return true
    }
    return false
  }
}

registerUniversal(CreditCardDetector)

export { CreditCardDetector }
