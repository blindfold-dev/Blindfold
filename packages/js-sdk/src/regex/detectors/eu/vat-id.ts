// EU VAT ID detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class VatIdDetector extends RegexDetector {
  entityType = EntityType.VAT_ID
  score = 0.9
  // EU VAT numbers: 2-letter country prefix + country-specific format
  pattern = new RegExp(
    '\\b(?:' +
      'ATU\\d{8}' + // Austria
      '|BE[01]\\d{9}' + // Belgium
      '|DE\\d{9}' + // Germany
      '|DK\\d{8}' + // Denmark
      '|ES[A-Z0-9]\\d{7}[A-Z0-9]' + // Spain
      '|FI\\d{8}' + // Finland
      '|FR[A-Z0-9]{2}\\d{9}' + // France
      '|IT\\d{11}' + // Italy
      '|LU\\d{8}' + // Luxembourg
      '|NL\\d{9}B\\d{2}' + // Netherlands
      '|PL\\d{10}' + // Poland
      '|PT\\d{9}' + // Portugal
      '|SE\\d{12}' + // Sweden
      ')\\b',
    'g'
  )
}

registerRegion('eu', VatIdDetector)

export { VatIdDetector }
