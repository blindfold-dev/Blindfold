// Lithuanian Personal Code (Asmens kodas) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { ltPersonalCodeChecksum } from '../../validators'

class LtPersonalCodeDetector extends RegexDetector {
  entityType = EntityType.LT_PERSONAL_CODE
  score = 0.85
  contextKeywords = [
    'asmens kodas',
    'personal code',
    'asmens',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b[1-6]\d{10}\b/g
  validator = ltPersonalCodeChecksum
}

registerRegion('lt', LtPersonalCodeDetector)

export { LtPersonalCodeDetector }
