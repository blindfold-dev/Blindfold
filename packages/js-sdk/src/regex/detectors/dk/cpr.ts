// Danish CPR (Central Person Register) number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { dkCprValidDate } from '../../validators'

class DkCprDetector extends RegexDetector {
  entityType = EntityType.DK_CPR
  score = 0.85
  contextKeywords = [
    'cpr', 'personnummer', 'cpr-nummer', 'central person',
  ]
  contextRequired = true

  pattern = /\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{2}[-\s]?\d{4}\b/g
  validator = dkCprValidDate
}

registerRegion('dk', DkCprDetector)

export { DkCprDetector }
