// Hungarian Tax ID detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { huTaxIdChecksum } from '../../validators'

class HuTaxIdDetector extends RegexDetector {
  entityType = EntityType.HU_TAX_ID
  score = 0.85
  contextKeywords = [
    'adoazonosito',
    'adószám',
    'tax id',
    'tax number',
    'adoazonosito jel',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b8\d{9}\b/g
  validator = huTaxIdChecksum
}

registerRegion('hu', HuTaxIdDetector)

export { HuTaxIdDetector }
