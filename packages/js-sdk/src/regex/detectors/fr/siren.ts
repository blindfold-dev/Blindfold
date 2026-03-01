// French SIREN (company identification) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { luhnChecksum } from '../../validators'

class FrSirenDetector extends RegexDetector {
  entityType = EntityType.FR_SIREN
  score = 0.85
  contextKeywords = ['siren', 'siret', 'registre du commerce', 'rcs', 'company number']
  contextRequired = true

  pattern = /\b\d{3}[- ]?\d{3}[- ]?\d{3}\b/g
  validator = luhnChecksum
}

registerRegion('fr', FrSirenDetector)

export { FrSirenDetector }
