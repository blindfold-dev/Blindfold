// Czech DIC (Tax/VAT ID) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { czDicValid } from '../../validators'

class CzDicDetector extends RegexDetector {
  entityType = EntityType.CZ_DIC
  score = 0.85
  contextKeywords = [
    'dic',
    'di\u010d',
    'danove identifikacni cislo',
    'da\u0148ov\u00e9 identifika\u010dn\u00ed \u010d\u00edslo',
    'vat',
    'tax id',
  ]
  contextRequired = false

  pattern = /\bCZ\d{8,10}\b/gi
  validator = czDicValid
}

registerRegion('cz', CzDicDetector)

export { CzDicDetector }
