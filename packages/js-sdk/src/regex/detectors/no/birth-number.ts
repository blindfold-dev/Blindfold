// Norwegian Birth Number (Fodselsnummer) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { noBirthNumberChecksum } from '../../validators'

class NoBirthNumberDetector extends RegexDetector {
  entityType = EntityType.NO_BIRTH_NUMBER
  score = 0.90
  contextKeywords = [
    'fodselsnummer', 'birth number', 'personnummer', 'f\u00f8dselsnummer',
  ]
  contextRequired = false

  pattern = /\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{7}\b/g
  validator = noBirthNumberChecksum
}

registerRegion('no', NoBirthNumberDetector)

export { NoBirthNumberDetector }
