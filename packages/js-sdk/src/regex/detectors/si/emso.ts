// Slovenian Personal Identification Number (EMSO) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { siEmsoChecksum } from '../../validators'

class SiEmsoDetector extends RegexDetector {
  entityType = EntityType.SI_EMSO
  score = 0.85
  contextKeywords = [
    'emso',
    'enotna maticna stevilka',
    'maticna stevilka',
    'personal number',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{13}\b/g
  validator = siEmsoChecksum
}

registerRegion('si', SiEmsoDetector)

export { SiEmsoDetector }
