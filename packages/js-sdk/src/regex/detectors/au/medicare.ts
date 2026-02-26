// Australian Medicare Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { auMedicareChecksum } from '../../validators'

class AuMedicareDetector extends RegexDetector {
  entityType = EntityType.AU_MEDICARE
  score = 0.85
  contextKeywords = ['medicare', 'medicare card', 'medicare number']
  contextRequired = true

  // 10-11 digits: XXXX-XXXXX-X-X
  pattern = /\b\d{4}[- ]?\d{5}[- ]?\d[- ]?\d?\b/g
  validator = auMedicareChecksum
}

registerRegion('au', AuMedicareDetector)

export { AuMedicareDetector }
