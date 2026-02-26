// Romanian CNP (Cod Numeric Personal) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { roCnpChecksum } from '../../validators'

class RoCnpDetector extends RegexDetector {
  entityType = EntityType.RO_CNP
  score = 0.9
  contextKeywords = ['cnp', 'cod numeric personal', 'personal numeric code']
  contextRequired = false

  pattern = /\b[1-8]\d{12}\b/g
  validator = roCnpChecksum
}

registerRegion('ro', RoCnpDetector)

export { RoCnpDetector }
