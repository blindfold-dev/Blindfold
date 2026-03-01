// Slovenian Tax Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { siTaxNumberChecksum } from '../../validators'

class SiTaxNumberDetector extends RegexDetector {
  entityType = EntityType.SI_TAX_NUMBER
  score = 0.85
  contextKeywords = [
    'davcna stevilka',
    'davcna',
    'tax number',
    'davčna številka',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b(?:SI)?\d{8}\b/gi
  validator = siTaxNumberChecksum
}

registerRegion('si', SiTaxNumberDetector)

export { SiTaxNumberDetector }
