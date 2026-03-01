// Belgian National Number (Rijksregisternummer) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { beNationalNumberChecksum } from '../../validators'

class BeNationalNumberDetector extends RegexDetector {
  entityType = EntityType.BE_NATIONAL_NUMBER
  score = 0.85
  contextKeywords = [
    'rijksregisternummer',
    'national number',
    'numero national',
    'registre national',
    'nn',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{2}[. ]?\d{2}[. ]?\d{2}[- ]?\d{3}[. ]?\d{2}\b/g
  validator = beNationalNumberChecksum
}

registerRegion('be', BeNationalNumberDetector)

export { BeNationalNumberDetector }
