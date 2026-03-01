// Swedish Organisationsnummer (organization number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { seOrgnrChecksum } from '../../validators'

class SeOrgnrDetector extends RegexDetector {
  entityType = EntityType.SE_ORGNR
  score = 0.85
  contextKeywords = ['organisationsnummer', 'orgnr', 'org nr', 'organization number', 'foretag']
  contextRequired = true

  pattern = /\b\d{6}-?\d{4}\b/g
  validator = seOrgnrChecksum
}

registerRegion('se', SeOrgnrDetector)

export { SeOrgnrDetector }
