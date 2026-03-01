// Canadian SIN (Social Insurance Number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { luhnChecksum } from '../../validators'

class CaSinDetector extends RegexDetector {
  entityType = EntityType.CA_SIN
  score = 0.85
  contextKeywords = ['sin', 'social insurance number', 'numero assurance sociale', 'nas']
  contextRequired = true

  pattern = /\b\d{3}[- ]?\d{3}[- ]?\d{3}\b/g
  validator = luhnChecksum
}

registerRegion('ca', CaSinDetector)

export { CaSinDetector }
