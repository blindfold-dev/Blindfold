// Latvian Personal Code (Personas kods) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { lvPersonalCodeChecksum } from '../../validators'

class LvPersonalCodeDetector extends RegexDetector {
  entityType = EntityType.LV_PERSONAL_CODE
  score = 0.85
  contextKeywords = [
    'personas kods',
    'personal code',
    'personas',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{6}-?\d{5}\b/g
  validator = lvPersonalCodeChecksum
}

registerRegion('lv', LvPersonalCodeDetector)

export { LvPersonalCodeDetector }
