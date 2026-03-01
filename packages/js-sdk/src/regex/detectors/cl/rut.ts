// Chilean RUT (Rol Unico Tributario) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { clRutChecksum } from '../../validators'

class ClRutDetector extends RegexDetector {
  entityType = EntityType.CL_RUT
  score = 0.85
  contextKeywords = ['rut', 'run', 'rol unico tributario', 'rol unico nacional']
  contextRequired = true

  // XX.XXX.XXX-X format (check digit can be 0-9 or K)
  pattern = /\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]\b/g
  validator = clRutChecksum
}

registerRegion('cl', ClRutDetector)

export { ClRutDetector }
