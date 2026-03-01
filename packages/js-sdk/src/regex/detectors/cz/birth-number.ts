// Czech Birth Number (Rodne Cislo) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { czBirthNumberValid } from '../../validators'

class CzBirthNumberDetector extends RegexDetector {
  entityType = EntityType.CZ_BIRTH_NUMBER
  score = 0.85
  contextKeywords = ['rodne cislo', 'birth number', 'rc', 'rodn\u00e9 \u010d\u00edslo']
  contextRequired = false

  pattern = /\b\d{6}\/?\d{3,4}\b/g
  validator = czBirthNumberValid
}

registerRegion('cz', CzBirthNumberDetector)

export { CzBirthNumberDetector }
