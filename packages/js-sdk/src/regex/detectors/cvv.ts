// CVV/CVC detector (always context-required)

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

class CvvDetector extends RegexDetector {
  entityType = EntityType.CVV
  score = 0.80
  contextKeywords = [
    'cvv', 'cvc', 'security code', 'card verification', 'cvv2', 'cvc2',
    'csv',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{3,4}\b/g
}

registerUniversal(CvvDetector)

export { CvvDetector }
