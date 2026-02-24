// Italian Codice Fiscale detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { itCodiceFiscaleCheck } from '../../validators'

class ItCodiceFiscaleDetector extends RegexDetector {
  entityType = EntityType.IT_CODICE_FISCALE
  score = 0.90
  contextKeywords = [
    'codice fiscale', 'cf', 'fiscal code',
  ]
  contextRequired = false

  pattern = /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi
  validator = itCodiceFiscaleCheck
}

registerRegion('it', ItCodiceFiscaleDetector)

export { ItCodiceFiscaleDetector }
