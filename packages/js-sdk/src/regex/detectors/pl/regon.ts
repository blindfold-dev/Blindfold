// Polish REGON (statistical number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { plRegonChecksum } from '../../validators'

class PlRegonDetector extends RegexDetector {
  entityType = EntityType.PL_REGON
  score = 0.85
  contextKeywords = ['regon', 'statistical number', 'numer statystyczny']
  contextRequired = true

  pattern = /\b\d{9}(?:\d{5})?\b/g
  validator = plRegonChecksum
}

registerRegion('pl', PlRegonDetector)

export { PlRegonDetector }
