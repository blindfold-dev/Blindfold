// URL detector

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

class UrlDetector extends RegexDetector {
  entityType = EntityType.URL
  score = 0.95
  pattern = /https?:\/\/(?:[\w\-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>"']*)?/gi

  preCheck(text: string): boolean {
    return text.includes('://')
  }
}

registerUniversal(UrlDetector)

export { UrlDetector }
