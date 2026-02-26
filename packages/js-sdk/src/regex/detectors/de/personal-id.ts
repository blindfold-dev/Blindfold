// German Personal ID (Personalausweis) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class DePersonalIdDetector extends RegexDetector {
  entityType = EntityType.DE_PERSONAL_ID
  score = 0.75
  contextKeywords = [
    'personalausweis',
    'personal id',
    'ausweis',
    'identifikation',
    'id-nummer',
    'ausweisnummer',
  ]
  contextRequired = true
  contextWindow = 50

  pattern = /\b[CFGHJKLMNPRTVWXYZ][0-9A-Z][0-9]{7}[0-9]\b/gi
}

registerRegion('de', DePersonalIdDetector)

export { DePersonalIdDetector }
