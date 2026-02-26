// Indian Aadhaar Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { inAadhaarChecksum } from '../../validators'

class InAadhaarDetector extends RegexDetector {
  entityType = EntityType.IN_AADHAAR
  score = 0.85
  contextKeywords = ['aadhaar', 'aadhar', 'uidai', 'unique identification']
  contextRequired = true

  // 12 digits starting with 2-9, with optional separators
  pattern = /\b[2-9]\d{3}[- ]?\d{4}[- ]?\d{4}\b/g
  validator = inAadhaarChecksum
}

registerRegion('in', InAadhaarDetector)

export { InAadhaarDetector }
