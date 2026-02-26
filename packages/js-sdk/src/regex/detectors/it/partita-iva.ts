// Italian Partita IVA (VAT number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { itPartitaIvaChecksum } from '../../validators'

class ItPartitaIvaDetector extends RegexDetector {
  entityType = EntityType.IT_PARTITA_IVA
  score = 0.85
  contextKeywords = ['partita iva', 'p.iva', 'p. iva', 'vat', 'iva']
  contextRequired = true

  pattern = /\b(?:IT)?\d{11}\b/gi
  validator = itPartitaIvaChecksum
}

registerRegion('it', ItPartitaIvaDetector)

export { ItPartitaIvaDetector }
