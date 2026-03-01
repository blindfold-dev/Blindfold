// Hungarian Social Security Number (TAJ) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { huTajChecksum } from '../../validators'

class HuTajDetector extends RegexDetector {
  entityType = EntityType.HU_TAJ
  score = 0.85
  contextKeywords = [
    'taj',
    'tarsadalombiztositasi',
    'social security',
    'társadalombiztosítási',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{3}[- ]?\d{3}[- ]?\d{3}\b/g
  validator = huTajChecksum
}

registerRegion('hu', HuTajDetector)

export { HuTajDetector }
