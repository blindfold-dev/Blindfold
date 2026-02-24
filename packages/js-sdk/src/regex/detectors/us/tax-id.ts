// US Tax ID / EIN detector (context-required)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class TaxIdDetector extends RegexDetector {
  entityType = EntityType.TAX_ID
  score = 0.80
  contextKeywords = [
    'ein', 'tax id', 'tax identification', 'employer identification',
    'tin', 'tax #', 'ein#',
  ]
  contextRequired = true
  contextWindow = 50

  // EIN format: XX-XXXXXXX (first two digits are valid prefixes)
  pattern = /\b\d{2}-\d{7}\b/g
}

registerRegion('us', TaxIdDetector)

export { TaxIdDetector }
