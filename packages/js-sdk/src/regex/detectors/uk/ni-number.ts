// UK National Insurance Number detector (scrubadub-inspired pattern)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class NiNumberDetector extends RegexDetector {
  entityType = EntityType.NI_NUMBER
  score = 0.9
  // Scrubadub pattern: negative lookaheads for invalid prefixes
  pattern = new RegExp(
    '\\b' +
      '(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)' +
      '[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]' +
      '\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?[A-D]' +
      '\\b',
    'gi'
  )
}

registerRegion('uk', NiNumberDetector)

export { NiNumberDetector }
