// Bulgarian Personal Number (EGN) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { bgEgnChecksum } from '../../validators'

class BgEgnDetector extends RegexDetector {
  entityType = EntityType.BG_EGN
  score = 0.85
  contextKeywords = [
    'egn',
    'егн',
    'edinen grazhdanski nomer',
    'personal number',
    'civil number',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b\d{10}\b/g
  validator = bgEgnChecksum
}

registerRegion('bg', BgEgnDetector)

export { BgEgnDetector }
