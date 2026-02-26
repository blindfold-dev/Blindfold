// Australian TFN (Tax File Number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { auTfnChecksum } from '../../validators'

class AuTfnDetector extends RegexDetector {
  entityType = EntityType.AU_TFN
  score = 0.85
  contextKeywords = ['tfn', 'tax file number', 'tax file no']
  contextRequired = true

  // 8 or 9 digits with optional separators
  pattern = /\b\d{3}[- ]?\d{3}[- ]?\d{2,3}\b/g
  validator = auTfnChecksum
}

registerRegion('au', AuTfnDetector)

export { AuTfnDetector }
