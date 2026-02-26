// Polish PESEL detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { plPeselChecksum } from '../../validators'

class PlPeselDetector extends RegexDetector {
  entityType = EntityType.PL_PESEL
  score = 0.85
  contextKeywords = ['pesel']
  contextRequired = false

  pattern = /\b\d{11}\b/g
  validator = plPeselChecksum
}

registerRegion('pl', PlPeselDetector)

export { PlPeselDetector }
