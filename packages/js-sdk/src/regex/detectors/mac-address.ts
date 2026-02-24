// MAC address detector

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

class MacAddressDetector extends RegexDetector {
  entityType = EntityType.MAC_ADDRESS
  score = 0.95
  // Standard MAC formats: AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF
  pattern = /\b(?:[0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}\b/g
}

registerUniversal(MacAddressDetector)

export { MacAddressDetector }
