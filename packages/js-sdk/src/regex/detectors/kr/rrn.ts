// South Korean RRN (Resident Registration Number) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { krRrnChecksum } from '../../validators'

class KrRrnDetector extends RegexDetector {
  entityType = EntityType.KR_RRN
  score = 0.85
  contextKeywords = ['\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638', 'resident registration', 'jumin', 'rrn']
  contextRequired = true

  // 13 digits: YYMMDD-NNNNNNN
  pattern = /\b\d{6}[- ]?\d{7}\b/g
  validator = krRrnChecksum
}

registerRegion('kr', KrRrnDetector)

export { KrRrnDetector }
