// Russian SNILS (insurance pension number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { ruSnilsChecksum } from '../../validators'

class RuSnilsDetector extends RegexDetector {
  entityType = EntityType.RU_SNILS
  score = 0.85
  contextKeywords = [
    'snils',
    '\u0441\u043d\u0438\u043b\u0441',
    'pension',
    '\u043f\u0435\u043d\u0441\u0438\u043e\u043d',
    '\u0441\u0442\u0440\u0430\u0445\u043e\u0432\u043e\u0435 \u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e',
  ]
  contextRequired = true

  pattern = /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{2}\b/g
  validator = ruSnilsChecksum
}

registerRegion('ru', RuSnilsDetector)

export { RuSnilsDetector }
