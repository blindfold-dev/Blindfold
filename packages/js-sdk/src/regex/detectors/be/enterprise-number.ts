// Belgian Enterprise Number (BCE/KBO) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { beEnterpriseChecksum } from '../../validators'

class BeEnterpriseNumberDetector extends RegexDetector {
  entityType = EntityType.BE_ENTERPRISE_NUMBER
  score = 0.85
  contextKeywords = [
    'bce',
    'kbo',
    'enterprise number',
    'ondernemingsnummer',
    'numero entreprise',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b[01]\d{3}[. ]?\d{3}[. ]?\d{3}\b/g
  validator = beEnterpriseChecksum
}

registerRegion('be', BeEnterpriseNumberDetector)

export { BeEnterpriseNumberDetector }
