// Credit card number detector with Luhn validation

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'
import { luhnChecksum } from '../validators'

class CreditCardDetector extends RegexDetector {
  entityType = EntityType.CREDIT_CARD
  score = 0.90
  // Visa, Mastercard, Amex, Discover with optional separators
  pattern = new RegExp(
    '\\b(?:'
    + '4\\d{3}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}'     // Visa
    + '|5[1-5]\\d{2}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}' // Mastercard
    + '|3[47]\\d{2}[-\\s]?\\d{6}[-\\s]?\\d{5}'               // Amex
    + '|6(?:011|5\\d{2})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}' // Discover
    + ')\\b',
    'g'
  )
  validator = luhnChecksum
}

registerUniversal(CreditCardDetector)

export { CreditCardDetector }
