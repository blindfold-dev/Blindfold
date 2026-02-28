// Phone number detector (NANP + international + EU trunk formats)

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

const DATE_LIKE = /^\d{1,2}[-./]\d{1,2}[-./]\d{2,4}$/
const SSN_LIKE = /^\d{3}[-.\s]\d{2}[-.\s]\d{4}$/

function phoneLengthCheck(text: string): boolean {
  let digits = 0
  for (const c of text) {
    if (c >= '0' && c <= '9') digits++
  }
  if (digits < 7 || digits > 15) return false
  // Reject date-like patterns (e.g., 03-15-1990) to avoid stealing DOB matches
  if (DATE_LIKE.test(text)) return false
  // Reject SSN-like patterns (e.g., 044-10-7757) to avoid stealing SSN matches
  if (SSN_LIKE.test(text)) return false
  return true
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
