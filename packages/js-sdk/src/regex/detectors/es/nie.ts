// Spanish NIE (Numero de Identidad de Extranjero) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { esNieLetter } from '../../validators'

class EsNieDetector extends RegexDetector {
  entityType = EntityType.ES_NIE
  score = 0.9
  contextKeywords = ['nie', 'extranjero', 'numero de identidad']
  contextRequired = false

  pattern = /\b[XYZ]\d{7}[-\s]?[A-Z]\b/gi
  validator = esNieLetter
}

registerRegion('es', EsNieDetector)

export { EsNieDetector }
