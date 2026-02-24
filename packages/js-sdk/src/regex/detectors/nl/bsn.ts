// Dutch BSN (Burgerservicenummer) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { nlBsn11test } from '../../validators'

class NlBsnDetector extends RegexDetector {
  entityType = EntityType.NL_BSN
  score = 0.85
  contextKeywords = [
    'bsn', 'burgerservicenummer', 'sofi', 'citizen service',
  ]
  contextRequired = true

  pattern = /\b\d{9}\b/g
  validator = nlBsn11test
}

registerRegion('nl', NlBsnDetector)

export { NlBsnDetector }
