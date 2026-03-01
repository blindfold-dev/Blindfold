// Colombian NIT (Numero de Identificacion Tributaria) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { coNitChecksum } from '../../validators'

class CoNitDetector extends RegexDetector {
  entityType = EntityType.CO_NIT
  score = 0.85
  contextKeywords = ['nit', 'numero de identificacion tributaria', 'identificacion tributaria']
  contextRequired = true

  // XXX.XXX.XXX-X format
  pattern = /\b\d{3}\.?\d{3}\.?\d{3}-?\d\b/g
  validator = coNitChecksum
}

registerRegion('co', CoNitDetector)

export { CoNitDetector }
