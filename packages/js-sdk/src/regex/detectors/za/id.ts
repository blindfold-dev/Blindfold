// South African ID Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { luhnChecksum } from '../../validators'

class ZaIdDetector extends RegexDetector {
  entityType = EntityType.ZA_ID
  score = 0.85
  contextKeywords = ['id number', 'identity number', 'south african id', 'sa id']
  contextRequired = true

  // 13 digits
  pattern = /\b\d{13}\b/g
  validator = luhnChecksum
}

registerRegion('za', ZaIdDetector)

export { ZaIdDetector }
