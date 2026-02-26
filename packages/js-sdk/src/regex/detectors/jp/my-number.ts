// Japanese My Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { jpMyNumberChecksum } from '../../validators'

class JpMyNumberDetector extends RegexDetector {
  entityType = EntityType.JP_MY_NUMBER
  score = 0.85
  contextKeywords = ['my number', '\u30DE\u30A4\u30CA\u30F3\u30D0\u30FC', 'kojin bango', 'individual number']
  contextRequired = true

  // 12 digits with optional separators
  pattern = /\b\d{4}[- ]?\d{4}[- ]?\d{4}\b/g
  validator = jpMyNumberChecksum
}

registerRegion('jp', JpMyNumberDetector)

export { JpMyNumberDetector }
