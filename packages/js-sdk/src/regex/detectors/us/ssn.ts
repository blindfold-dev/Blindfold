// US Social Security Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { ssnValidFormat } from '../../validators'

class SsnDetector extends RegexDetector {
  entityType = EntityType.SSN
  score = 0.85
  contextKeywords = ['ssn', 'social security', 'social sec', 'ss#', 'ss #']
  contextRequired = false
  contextWindow = 50

  // SSN format with negative lookaheads for invalid area/group/serial
  pattern = new RegExp(
    '\\b(?!000|666|9\\d{2})\\d{3}' + '[-.\\s]' + '(?!00)\\d{2}' + '[-.\\s]' + '(?!0000)\\d{4}\\b',
    'g'
  )
  validator = ssnValidFormat
}

registerRegion('us', SsnDetector)

export { SsnDetector }
