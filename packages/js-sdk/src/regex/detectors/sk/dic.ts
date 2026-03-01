// Slovak DIC (tax identification number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { skDicValid } from '../../validators'

class SkDicDetector extends RegexDetector {
  entityType = EntityType.SK_DIC
  score = 0.85
  contextKeywords = ['dic', 'dič', 'danove identifikacne cislo', 'daňové identifikačné číslo', 'vat', 'tax id']
  contextRequired = false

  pattern = /\bSK\d{10}\b/gi
  validator = skDicValid
}

registerRegion('sk', SkDicDetector)

export { SkDicDetector }
