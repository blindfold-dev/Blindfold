// Irish Personal Public Service (PPS) Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { iePpsChecksum } from '../../validators'

class IePpsDetector extends RegexDetector {
  entityType = EntityType.IE_PPS
  score = 0.85
  contextKeywords = [
    'pps',
    'ppsn',
    'personal public service',
    'revenue',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{7}[A-Z]{1,2}\b/gi
  validator = iePpsChecksum
}

registerRegion('ie', IePpsDetector)

export { IePpsDetector }
