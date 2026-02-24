// Portuguese NIF (Numero de Identificacao Fiscal) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { ptNifChecksum } from '../../validators'

class PtNifDetector extends RegexDetector {
  entityType = EntityType.PT_NIF
  score = 0.85
  contextKeywords = [
    'nif', 'contribuinte', 'fiscal', 'tax',
  ]
  contextRequired = true

  pattern = /\b[1-3589]\d{8}\b/g
  validator = ptNifChecksum
}

registerRegion('pt', PtNifDetector)

export { PtNifDetector }
