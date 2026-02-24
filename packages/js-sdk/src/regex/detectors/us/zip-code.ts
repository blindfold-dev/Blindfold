// US ZIP Code detector (context-required)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class ZipCodeDetector extends RegexDetector {
  entityType = EntityType.ZIP_CODE
  score = 0.70
  contextKeywords = [
    'zip', 'postal', 'zip code', 'zipcode', 'postal code',
  ]
  contextRequired = true
  contextWindow = 50

  // 5 digits or 5+4 format
  pattern = /\b\d{5}(?:-\d{4})?\b/g
}

registerRegion('us', ZipCodeDetector)

export { ZipCodeDetector }
