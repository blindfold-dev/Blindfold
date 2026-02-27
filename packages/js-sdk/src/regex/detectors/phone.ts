// Phone number detector (NANP + international + EU trunk formats)

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

function phoneLengthCheck(text: string): boolean {
  let digits = 0
  for (const c of text) {
    if (c >= '0' && c <= '9') digits++
  }
  return digits >= 7 && digits <= 15
}

class PhoneDetector extends RegexDetector {
  entityType = EntityType.PHONE_NUMBER
  score = 0.85
  pattern = new RegExp(
    '(?<!\\d)' +
      '(?:' +
      // NANP with parens: separator optional after closing paren
      '(?:\\+?1[-.\\s]?)?\\([2-9]\\d{2}\\)[-.\\s]?[2-9]\\d{2}[-.\\s]?\\d{4}' +
      '|' +
      // NANP without parens: first separator required
      '(?:\\+?1[-.\\s]?)?[2-9]\\d{2}[-.\\s][2-9]\\d{2}[-.\\s]?\\d{4}' +
      '|' +
      // International: +CC with optional separator after country code
      '\\+[1-9]\\d{0,2}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}' +
      '|' +
      // EU trunk prefix: 0XX followed by 7-11 digits with separators
      '0\\d{1,3}[-.\\s]\\d{2,4}[-.\\s]?\\d{2,4}[-.\\s]?\\d{0,4}' +
      ')' +
      // Optional extension
      '(?:\\s?(?:x|ext\\.?)\\s?\\d{1,5})?' +
      '(?!\\d)',
    'g'
  )
  validator = phoneLengthCheck
}

registerUniversal(PhoneDetector)

export { PhoneDetector }
