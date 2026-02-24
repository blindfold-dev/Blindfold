// Russian INN (taxpayer identification number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { ruInnChecksum } from '../../validators'

class RuInnDetector extends RegexDetector {
  entityType = EntityType.RU_INN
  score = 0.85
  contextKeywords = [
    'inn', '\u0438\u043d\u043d', 'taxpayer', '\u043d\u0430\u043b\u043e\u0433',
  ]
  contextRequired = true

  pattern = /\b\d{10}\b|\b\d{12}\b/g
  validator = ruInnChecksum
}

registerRegion('ru', RuInnDetector)

export { RuInnDetector }
