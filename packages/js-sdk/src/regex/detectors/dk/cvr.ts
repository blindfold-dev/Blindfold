// Danish CVR (company registration number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { dkCvrChecksum } from '../../validators'

class DkCvrDetector extends RegexDetector {
  entityType = EntityType.DK_CVR
  score = 0.85
  contextKeywords = ['cvr', 'virksomhed', 'erhvervsstyrelsen', 'company number', 'business id']
  contextRequired = true

  pattern = /\b(?:DK)?\d{8}\b/gi
  validator = dkCvrChecksum
}

registerRegion('dk', DkCvrDetector)

export { DkCvrDetector }
