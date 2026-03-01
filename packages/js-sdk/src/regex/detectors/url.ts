// URL detector

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

// Common TLDs — covers ~99% of real-world URLs
const VALID_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'io', 'co', 'dev', 'app', 'ai', 'me', 'us', 'uk', 'de', 'fr', 'it',
  'es', 'nl', 'be', 'at', 'ch', 'se', 'no', 'dk', 'fi', 'pl', 'cz',
  'sk', 'pt', 'ru', 'br', 'jp', 'kr', 'cn', 'in', 'au', 'nz', 'za',
  'ca', 'mx', 'ar', 'cl', 'il', 'tr', 'ie', 'hu', 'ro', 'bg', 'hr',
  'si', 'lt', 'lv', 'ee', 'info', 'biz', 'name', 'pro', 'xyz', 'online',
  'site', 'tech', 'store', 'shop', 'cloud', 'page', 'link', 'top',
  'icu', 'live', 'world', 'blog', 'news', 'tv', 'cc', 'ly', 'gg',
  'to', 'eu', 'asia',
])

function urlValidTld(text: string): boolean {
  try {
    const afterScheme = text.split('://', 2)[1]
    if (!afterScheme) return false
    const domain = afterScheme.split('/')[0].split('?')[0].split('#')[0]
    const parts = domain.replace(/\.$/, '').split('.')
    if (parts.length < 2) return false
    const tld = parts[parts.length - 1].toLowerCase()
    return VALID_TLDS.has(tld)
  } catch {
    return false
  }
}

class UrlDetector extends RegexDetector {
  entityType = EntityType.URL
  score = 0.85
  needsDigit = false
  pattern = /https?:\/\/(?:[\w\-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>"')\]]*)?/gi
  validator = urlValidTld

  preCheck(text: string): boolean {
    return text.includes('://')
  }
}

registerUniversal(UrlDetector)

export { UrlDetector }
