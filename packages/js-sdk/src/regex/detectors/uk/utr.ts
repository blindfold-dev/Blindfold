// UK Unique Taxpayer Reference (UTR) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { ukUtrChecksum } from '../../validators'

class UkUtrDetector extends RegexDetector {
  entityType = EntityType.UK_UTR
  score = 0.85
  contextKeywords = ['utr', 'unique taxpayer', 'tax reference', 'self assessment', 'hmrc']
  contextRequired = true

  pattern = /\b\d{10}\b/g
  validator = ukUtrChecksum
}

registerRegion('uk', UkUtrDetector)

export { UkUtrDetector }
