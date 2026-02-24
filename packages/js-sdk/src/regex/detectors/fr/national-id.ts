// French National ID (NIR / INSEE) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { frNirChecksum } from '../../validators'

class FrNationalIdDetector extends RegexDetector {
  entityType = EntityType.FR_NATIONAL_ID
  score = 0.90
  contextKeywords = [
    'nir', 'securite sociale', 'social security', 'numero national', 'insee',
  ]
  contextRequired = false

  pattern = /\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2]|[2-9]\d)\s?\d{2,3}\s?\d{3}\s?\d{3}\s?\d{2}\b/g
  validator = frNirChecksum
}

registerRegion('fr', FrNationalIdDetector)

export { FrNationalIdDetector }
