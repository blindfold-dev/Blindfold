// Czech ICO (Company ID) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { czIcoChecksum } from '../../validators'

class CzIcoDetector extends RegexDetector {
  entityType = EntityType.CZ_ICO
  score = 0.85
  contextKeywords = [
    'ico',
    'i\u010do',
    'identifikacni cislo',
    'identifika\u010dn\u00ed \u010d\u00edslo',
    'company id',
    'business id',
  ]
  contextRequired = true

  pattern = /\b\d{8}\b/g
  validator = czIcoChecksum
}

registerRegion('cz', CzIcoDetector)

export { CzIcoDetector }
