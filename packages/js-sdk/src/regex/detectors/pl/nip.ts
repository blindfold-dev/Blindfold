// Polish NIP (tax identification number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { plNipChecksum } from '../../validators'

class PlNipDetector extends RegexDetector {
  entityType = EntityType.PL_NIP
  score = 0.85
  contextKeywords = [
    'nip', 'tax', 'podatkowy',
  ]
  contextRequired = true

  pattern = /\b\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b/g
  validator = plNipChecksum
}

registerRegion('pl', PlNipDetector)

export { PlNipDetector }
