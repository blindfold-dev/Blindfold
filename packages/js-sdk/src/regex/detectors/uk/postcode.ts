// UK Postcode detector (scrubadub-inspired comprehensive pattern)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class UkPostcodeDetector extends RegexDetector {
  entityType = EntityType.UK_POSTCODE
  score = 0.85
  // Comprehensive UK postcode pattern covering all valid formats
  pattern = new RegExp(
    '\\b(?:'
    + '[A-Z]{1,2}\\d[A-Z\\d]?'   // Area + district
    + '\\s?'
    + '\\d[A-Z]{2}'              // Sector + unit
    + ')\\b',
    'gi'
  )
}

registerRegion('uk', UkPostcodeDetector)

export { UkPostcodeDetector }
