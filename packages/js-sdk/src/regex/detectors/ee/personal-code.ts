// Estonian Personal Code (Isikukood) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { eePersonalCodeChecksum } from '../../validators'

class EePersonalCodeDetector extends RegexDetector {
  entityType = EntityType.EE_PERSONAL_CODE
  score = 0.85
  contextKeywords = [
    'isikukood',
    'personal code',
    'identity code',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b[1-6]\d{10}\b/g
  validator = eePersonalCodeChecksum
}

registerRegion('ee', EePersonalCodeDetector)

export { EePersonalCodeDetector }
