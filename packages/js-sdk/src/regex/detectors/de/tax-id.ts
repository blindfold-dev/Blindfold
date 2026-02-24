// German Tax ID (Steueridentifikationsnummer) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { deTaxIdChecksum } from '../../validators'

class DeTaxIdDetector extends RegexDetector {
  entityType = EntityType.DE_TAX_ID
  score = 0.85
  contextKeywords = [
    'steuer', 'tax id', 'steueridentifikationsnummer', 'tin',
    'identifikationsnummer', 'steuernummer',
  ]
  contextRequired = false

  pattern = /\b\d{2}\s?\d{3}\s?\d{3}\s?\d{3}\b/g
  validator = deTaxIdChecksum
}

registerRegion('de', DeTaxIdDetector)

export { DeTaxIdDetector }
