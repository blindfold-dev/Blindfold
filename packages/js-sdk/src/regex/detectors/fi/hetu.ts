// Finnish Personal Identity Code (HETU) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { fiHetuChecksum } from '../../validators'

class FiHetuDetector extends RegexDetector {
  entityType = EntityType.FI_HETU
  score = 0.85
  contextKeywords = [
    'henkilotunnus',
    'hetu',
    'personal identity code',
    'sosiaaliturvatunnus',
  ]
  contextRequired = false

  pattern = /\b\d{6}[-+ABCDEFYXWVUabcdefyxwvu]\d{3}[0-9A-Za-z]\b/g
  validator = fiHetuChecksum
}

registerRegion('fi', FiHetuDetector)

export { FiHetuDetector }
