// Spanish DNI (Documento Nacional de Identidad) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { esDniLetter } from '../../validators'

class EsDniDetector extends RegexDetector {
  entityType = EntityType.ES_DNI
  score = 0.9
  contextKeywords = ['dni', 'documento nacional', 'identidad']
  contextRequired = false

  pattern = /\b\d{8}[-\s]?[A-Z]\b/gi
  validator = esDniLetter
}

registerRegion('es', EsDniDetector)

export { EsDniDetector }
