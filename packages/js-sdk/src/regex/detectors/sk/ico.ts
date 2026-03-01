// Slovak ICO (company identification number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { skIcoChecksum } from '../../validators'

class SkIcoDetector extends RegexDetector {
  entityType = EntityType.SK_ICO
  score = 0.85
  contextKeywords = ['ico', 'ičo', 'identifikacne cislo', 'identifikačné číslo', 'company id', 'business id']
  contextRequired = true

  pattern = /\b\d{8}\b/g
  validator = skIcoChecksum
}

registerRegion('sk', SkIcoDetector)

export { SkIcoDetector }
