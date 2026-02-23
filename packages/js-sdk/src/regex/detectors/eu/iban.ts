// IBAN detector with mod-97 checksum validation

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { ibanMod97 } from '../../validators'

class IbanDetector extends RegexDetector {
  entityType = EntityType.IBAN
  score = 0.90
  // IBAN: 2 letter country code + 2 check digits + up to 30 alphanumeric chars
  pattern = /\b[A-Z]{2}\d{2}\s?[\dA-Z]{4}(?:\s?[\dA-Z]{4}){1,7}(?:\s?[\dA-Z]{1,4})?\b/g
  validator = ibanMod97
}

registerRegion('eu', IbanDetector)

export { IbanDetector }
