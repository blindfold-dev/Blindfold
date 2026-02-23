// IP address detector (IPv4 and IPv6)

import { Detector } from '../base'
import { EntityType, PIIMatch } from '../entities'
import { registerUniversal } from '../registry'

const IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g

const IPV6 = new RegExp(
  '\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b'
  + '|\\b(?:[0-9a-fA-F]{1,4}:){1,7}:\\b'
  + '|\\b::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}\\b',
  'g'
)

class IpAddressDetector extends Detector {
  entityType = EntityType.IP_ADDRESS
  score = 0.95

  iterMatches(text: string): PIIMatch[] {
    const results: PIIMatch[] = []

    for (const pattern of [IPV4, IPV6]) {
      pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(text)) !== null) {
        const matchedText = match[0]
        const start = match.index
        // Skip common non-IP patterns like version numbers
        if (pattern === IPV4 && IpAddressDetector.isVersionNumber(text, start)) {
          continue
        }
        results.push({
          entityType: this.entityType,
          text: matchedText,
          start,
          end: start + matchedText.length,
          score: this.score,
        })
      }
    }

    return results
  }

  /** Skip patterns preceded by 'v' or 'version' that look like version numbers. */
  private static isVersionNumber(text: string, start: number): boolean {
    if (start > 0 && text[start - 1].toLowerCase() === 'v') {
      return true
    }
    const prefix = text.slice(Math.max(0, start - 10), start).toLowerCase().trim()
    return prefix.endsWith('version')
  }
}

registerUniversal(IpAddressDetector)

export { IpAddressDetector }
