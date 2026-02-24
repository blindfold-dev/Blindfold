// Email address detector

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

class EmailDetector extends RegexDetector {
  entityType = EntityType.EMAIL_ADDRESS
  score = 0.95
  pattern = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g

  preCheck(text: string): boolean {
    return text.includes('@')
  }
}

registerUniversal(EmailDetector)

export { EmailDetector }
