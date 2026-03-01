// Romanian CUI (company identification number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { roCuiChecksum } from '../../validators'

class RoCuiDetector extends RegexDetector {
  entityType = EntityType.RO_CUI
  score = 0.85
  contextKeywords = ['cui', 'cod unic', 'cod de inregistrare', 'fiscal code', 'cif']
  contextRequired = true

  pattern = /\b(?:RO)?\d{2,10}\b/gi
  validator = roCuiChecksum
}

registerRegion('ro', RoCuiDetector)

export { RoCuiDetector }
