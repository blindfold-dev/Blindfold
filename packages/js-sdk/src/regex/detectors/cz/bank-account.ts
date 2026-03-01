// Czech Bank Account Number detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { czBankAccountValid } from '../../validators'

class CzBankAccountDetector extends RegexDetector {
  entityType = EntityType.CZ_BANK_ACCOUNT
  score = 0.85
  contextKeywords = [
    'ucet',
    '\u00fa\u010det',
    'cislo uctu',
    '\u010d\u00edslo \u00fa\u010dtu',
    'bank account',
    'bankovni',
    'bankovn\u00ed',
  ]
  contextRequired = false

  pattern = /\b(?:\d{1,6}-)?\d{2,10}\/\d{4}\b/g
  validator = czBankAccountValid
}

registerRegion('cz', CzBankAccountDetector)

export { CzBankAccountDetector }
