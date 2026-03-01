// UK Passport number detector (context-required)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class UkPassportDetector extends RegexDetector {
  entityType = EntityType.UK_PASSPORT
  score = 0.75
  contextKeywords = ['passport', 'passport#', 'passport #', 'passport number', 'passport no']
  contextRequired = true
  contextWindow = 50

  // UK passport: 9 digits
  pattern = /\b\d{9}\b/g
}

registerRegion('uk', UkPassportDetector)

export { UkPassportDetector }
