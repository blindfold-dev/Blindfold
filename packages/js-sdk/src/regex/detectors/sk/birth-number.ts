// Slovak Birth Number (Rodne Cislo) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { skBirthNumberValid } from '../../validators'

class SkBirthNumberDetector extends RegexDetector {
  entityType = EntityType.SK_BIRTH_NUMBER
  score = 0.85
  contextKeywords = ['rodne cislo', 'birth number', 'rc', 'rodn\u00e9 \u010d\u00edslo']
  contextRequired = false

  pattern = /\b\d{6}\/?\d{3,4}\b/g
  validator = skBirthNumberValid
}

registerRegion('sk', SkBirthNumberDetector)

export { SkBirthNumberDetector }
