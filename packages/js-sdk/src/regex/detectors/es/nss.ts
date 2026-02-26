// Spanish Social Security Number (NSS) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { esNssChecksum } from '../../validators'

class EsNssDetector extends RegexDetector {
  entityType = EntityType.ES_NSS
  score = 0.85
  contextKeywords = ['nss', 'numero seguridad social', 'seguridad social', 'social security']
  contextRequired = true

  pattern = /\b\d{2}[- ]?\d{8}[- ]?\d{2}\b/g
  validator = esNssChecksum
}

registerRegion('es', EsNssDetector)

export { EsNssDetector }
