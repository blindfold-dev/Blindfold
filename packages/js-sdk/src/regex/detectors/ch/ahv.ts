// Swiss AHV (Social Insurance Number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { chAhvChecksum } from '../../validators'

class ChAhvDetector extends RegexDetector {
  entityType = EntityType.CH_AHV
  score = 0.85
  contextKeywords = ['ahv', 'avs', 'oasi', 'sozialversicherungsnummer', 'ahv-nr']
  contextRequired = false

  // 756.XXXX.XXXX.XX format
  pattern = /\b756[. ]?\d{4}[. ]?\d{4}[. ]?\d{2}\b/g
  validator = chAhvChecksum
}

registerRegion('ch', ChAhvDetector)

export { ChAhvDetector }
