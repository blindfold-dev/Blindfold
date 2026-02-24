// US Driver's License detector (context-required, top state formats)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class DriversLicenseDetector extends RegexDetector {
  entityType = EntityType.DRIVERS_LICENSE
  score = 0.75
  contextKeywords = [
    'driver', 'license', 'licence', 'dl', "driver's license",
    'driving license', 'dl#', 'dl #',
  ]
  contextRequired = true
  contextWindow = 50

  // Top state formats: CA (1L+7D), NY (9D), TX (8D), FL (1L+12D), IL (1L+11D)
  pattern = new RegExp(
    '\\b(?:'
    + '[A-Z]\\d{7}'     // CA: A1234567
    + '|\\d{9}'         // NY: 123456789
    + '|\\d{8}'         // TX: 12345678
    + '|[A-Z]\\d{12}'   // FL: A123456789012
    + '|[A-Z]\\d{11}'   // IL: A12345678901
    + ')\\b',
    'g'
  )
}

registerRegion('us', DriversLicenseDetector)

export { DriversLicenseDetector }
