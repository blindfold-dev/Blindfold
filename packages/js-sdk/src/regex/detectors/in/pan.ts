// Indian PAN (Permanent Account Number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { inPanValid } from '../../validators'

class InPanDetector extends RegexDetector {
  entityType = EntityType.IN_PAN
  score = 0.85
  contextKeywords = ['pan', 'permanent account number', 'income tax', 'pan card']
  contextRequired = true

  // AAAAA0000A format
  pattern = /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/gi
  validator = inPanValid
}

registerRegion('in', InPanDetector)

export { InPanDetector }
