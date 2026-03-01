// US Driver's License detector (context-required, top state formats)

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'

class DriversLicenseDetector extends RegexDetector {
  entityType = EntityType.DRIVERS_LICENSE
  score = 0.75
  contextKeywords = [
    'driver',
    'license',
    'licence',
    'dl',
    "driver's license",
    'driving license',
    'dl#',
    'dl #',
    'dmv',
    'permit',
  ]
  contextRequired = true
  contextWindow = 50

  // US state DL formats (ordered longest first to avoid partial matches)
  pattern = new RegExp(
    '\\b(?:' +
      '[A-Z]\\d{14}' +   // NJ: A12345678901234
      '|[A-Z]\\d{13}' +  // WI: A1234567890123
      '|[A-Z]\\d{12}' +  // FL: A123456789012
      '|[A-Z]\\d{11}' +  // IL: A12345678901
      '|[A-Z]\\d{10}' +  // MI: A1234567890
      '|[A-Z]\\d{8}' +   // MA/VA: A12345678
      '|[A-Z]{2}\\d{6}' + // OH: AB123456
      '|[A-Z]\\d{7}' +   // CA: A1234567
      '|\\d{9}' +        // NY: 123456789
      '|\\d{8}' +        // TX/PA: 12345678
      ')\\b',
    'g'
  )
}

registerRegion('us', DriversLicenseDetector)

export { DriversLicenseDetector }
