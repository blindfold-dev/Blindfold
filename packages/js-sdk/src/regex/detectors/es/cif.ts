// Spanish CIF (Codigo de Identificacion Fiscal) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { esCifChecksum } from '../../validators'

class EsCifDetector extends RegexDetector {
  entityType = EntityType.ES_CIF
  score = 0.85
  contextKeywords = ['cif', 'codigo de identificacion fiscal', 'tax id', 'nif empresa']
  contextRequired = false

  pattern = /\b[A-HJ-NP-SUVW]\d{7}[0-9A-J]\b/gi
  validator = esCifChecksum
}

registerRegion('es', EsCifDetector)

export { EsCifDetector }
