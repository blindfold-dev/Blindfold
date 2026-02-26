// Swedish Personnummer detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { sePersonnummerLuhn } from '../../validators'

class SePersonnummerDetector extends RegexDetector {
  entityType = EntityType.SE_PERSONNUMMER
  score = 0.9
  contextKeywords = ['personnummer', 'personal number', 'pnr']
  contextRequired = false

  pattern = /\b(?:\d{8}|\d{6})[-+]?\d{4}\b/g
  validator = sePersonnummerLuhn
}

registerRegion('se', SePersonnummerDetector)

export { SePersonnummerDetector }
