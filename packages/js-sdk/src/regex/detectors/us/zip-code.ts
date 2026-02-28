// US ZIP Code detector (context-required)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

function zipValid(text: string): boolean {
  let digits = ''
  for (const c of text) {
    if (c >= '0' && c <= '9') digits += c
  }
  return !digits.startsWith('000')
}

class ZipCodeDetector extends RegexDetector {
  entityType = EntityType.ZIP_CODE
  score = 0.7
  contextKeywords = [
    'zip', 'postal', 'zip code', 'zipcode', 'postal code',
    'address', 'city', 'state', 'mailing', 'shipping',
    'billing', 'delivery', 'location', 'resident', 'zip+4',
    'usa', 'united states',
  ]
  contextRequired = true
  contextWindow = 150

  // 5 digits or 5+4 format
  pattern = /\b\d{5}(?:-\d{4})?\b/g
  validator = zipValid
}

registerRegion('us', ZipCodeDetector)

export { ZipCodeDetector }
