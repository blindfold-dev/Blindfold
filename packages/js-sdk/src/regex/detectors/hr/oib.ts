// Croatian Personal Identification Number (OIB) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { hrOibChecksum } from '../../validators'

class HrOibDetector extends RegexDetector {
  entityType = EntityType.HR_OIB
  score = 0.85
  contextKeywords = [
    'oib',
    'osobni identifikacijski broj',
    'personal identification',
    'identifikacijski',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{11}\b/g
  validator = hrOibChecksum
}

registerRegion('hr', HrOibDetector)

export { HrOibDetector }
