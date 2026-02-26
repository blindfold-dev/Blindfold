// New Zealand IRD (Inland Revenue Department) Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { nzIrdChecksum } from '../../validators'

class NzIrdDetector extends RegexDetector {
  entityType = EntityType.NZ_IRD
  score = 0.85
  contextKeywords = ['ird', 'inland revenue', 'tax number', 'ird number']
  contextRequired = true

  // 8-9 digits with optional separators
  pattern = /\b\d{2,3}[- ]?\d{3}[- ]?\d{3}\b/g
  validator = nzIrdChecksum
}

registerRegion('nz', NzIrdDetector)

export { NzIrdDetector }
