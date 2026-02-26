// Phone number detector (NANP + international formats)

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

class PhoneDetector extends RegexDetector {
  entityType = EntityType.PHONE_NUMBER
  score = 0.85
  // NANP (US/CA) and international formats
  pattern = new RegExp(
    '(?<!\\d)' + // Negative lookbehind: no digit before
      '(?:' +
      // NANP: optional +1, area code, exchange, subscriber
      '(?:\\+?1[-.\\s]?)?\\(?[2-9]\\d{2}\\)?[-.\\s][2-9]\\d{2}[-.\\s]\\d{4}' +
      '|' +
      // International: +CC with separators
      '\\+[1-9]\\d{0,2}[-.\\s]\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}' +
      ')' +
      '(?!\\d)', // Negative lookahead: no digit after
    'g'
  )
}

registerUniversal(PhoneDetector)

export { PhoneDetector }
