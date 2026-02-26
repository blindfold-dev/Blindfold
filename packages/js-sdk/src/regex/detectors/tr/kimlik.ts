// Turkish Kimlik (National ID) Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { trKimlikChecksum } from '../../validators'

class TrKimlikDetector extends RegexDetector {
  entityType = EntityType.TR_KIMLIK
  score = 0.85
  contextKeywords = ['tc kimlik', 'kimlik no', 'tckn', 'vatandas', 'nufus']
  contextRequired = true

  // 11 digits, first digit non-zero
  pattern = /\b[1-9]\d{10}\b/g
  validator = trKimlikChecksum
}

registerRegion('tr', TrKimlikDetector)

export { TrKimlikDetector }
