// UK NHS Number detector with modulus 11 checksum

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { nhsChecksum } from '../../validators'

class NhsNumberDetector extends RegexDetector {
  entityType = EntityType.NHS_NUMBER
  score = 0.85
  contextKeywords = ['nhs', 'national health', 'nhs number', 'nhs#']
  contextRequired = false
  contextWindow = 50

  // 10 digits with optional spaces
  pattern = /\b\d{3}\s?\d{3}\s?\d{4}\b/g
  validator = nhsChecksum
}

registerRegion('uk', NhsNumberDetector)

export { NhsNumberDetector }
