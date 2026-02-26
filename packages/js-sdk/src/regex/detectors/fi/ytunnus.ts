// Finnish Business ID (Y-tunnus) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { fiYtunnusChecksum } from '../../validators'

class FiYtunnusDetector extends RegexDetector {
  entityType = EntityType.FI_YTUNNUS
  score = 0.85
  contextKeywords = [
    'y-tunnus',
    'ytunnus',
    'business id',
    'yritystunnus',
    'fo-nummer',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{7}-\d\b/g
  validator = fiYtunnusChecksum
}

registerRegion('fi', FiYtunnusDetector)

export { FiYtunnusDetector }
