// Austrian Social Insurance Number (SVNR) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { atSvnrChecksum } from '../../validators'

class AtSvnrDetector extends RegexDetector {
  entityType = EntityType.AT_SVNR
  score = 0.85
  contextKeywords = [
    'svnr',
    'sozialversicherungsnummer',
    'versicherungsnummer',
    'social insurance',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{4}[- ]?\d{6}\b/g
  validator = atSvnrChecksum
}

registerRegion('at', AtSvnrDetector)

export { AtSvnrDetector }
