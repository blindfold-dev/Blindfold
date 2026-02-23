// EU postal code detector (DE/FR/NL, context-required)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class EuPostalCodeDetector extends RegexDetector {
  entityType = EntityType.EU_POSTAL_CODE
  score = 0.70
  contextKeywords = [
    'postal', 'postcode', 'post code', 'zip', 'plz', 'postleitzahl',
    'code postal',
  ]
  contextRequired = true
  contextWindow = 50

  // DE: 5 digits | FR: 5 digits | NL: 4 digits + 2 letters
  pattern = new RegExp(
    '\\b(?:'
    + '\\d{5}'                  // DE, FR
    + '|\\d{4}\\s?[A-Z]{2}'    // NL
    + ')\\b',
    'g'
  )
}

registerRegion('eu', EuPostalCodeDetector)

export { EuPostalCodeDetector }
