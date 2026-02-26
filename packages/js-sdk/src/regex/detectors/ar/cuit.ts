// Argentine CUIT (Clave Unica de Identificacion Tributaria) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { arCuitChecksum } from '../../validators'

class ArCuitDetector extends RegexDetector {
  entityType = EntityType.AR_CUIT
  score = 0.85
  contextKeywords = ['cuit', 'cuil', 'clave unica', 'identificacion tributaria']
  contextRequired = true

  // XX-XXXXXXXX-X format
  pattern = /\b\d{2}-?\d{8}-?\d\b/g
  validator = arCuitChecksum
}

registerRegion('ar', ArCuitDetector)

export { ArCuitDetector }
