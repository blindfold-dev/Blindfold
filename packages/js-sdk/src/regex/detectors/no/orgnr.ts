// Norwegian Organisasjonsnummer (organization number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { noOrgnrChecksum } from '../../validators'

class NoOrgnrDetector extends RegexDetector {
  entityType = EntityType.NO_ORGNR
  score = 0.85
  contextKeywords = ['organisasjonsnummer', 'orgnr', 'org nr', 'organization number', 'foretaksnummer']
  contextRequired = true

  pattern = /\b\d{9}\b/g
  validator = noOrgnrChecksum
}

registerRegion('no', NoOrgnrDetector)

export { NoOrgnrDetector }
