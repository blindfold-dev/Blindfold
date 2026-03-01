// US Individual Taxpayer Identification Number (ITIN) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { usItinValid } from '../../validators'

class UsItinDetector extends RegexDetector {
  entityType = EntityType.US_ITIN
  score = 0.85
  contextKeywords = ['itin', 'individual taxpayer', 'tax identification']
  contextRequired = true

  pattern = /\b9\d{2}[- ]?\d{2}[- ]?\d{4}\b/g
  validator = usItinValid
}

registerRegion('us', UsItinDetector)

export { UsItinDetector }
