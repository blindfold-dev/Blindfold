// Israeli ID Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { luhnChecksum } from '../../validators'

class IlIdDetector extends RegexDetector {
  entityType = EntityType.IL_ID
  score = 0.85
  contextKeywords = ['teudat zehut', 'mispar zehut', 'identity number', '\u05EA.\u05D6', 'tz']
  contextRequired = true

  // 9 digits
  pattern = /\b\d{9}\b/g
  validator = luhnChecksum
}

registerRegion('il', IlIdDetector)

export { IlIdDetector }
