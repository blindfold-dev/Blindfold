// Format-preserving PII synthesis: generates realistic fake replacements locally

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randChar(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)]
}

function randHex(len: number): string {
  let result = ''
  for (let i = 0; i < len; i++) {
    result += randChar('0123456789abcdef')
  }
  return result
}

/**
 * Format-preserving default: replace digits with random digits,
 * uppercase with random uppercase, lowercase with random lowercase,
 * keep everything else (separators, symbols) intact.
 */
function formatPreserving(original: string): string {
  const chars: string[] = []
  for (const ch of original) {
    if (ch >= '0' && ch <= '9') {
      chars.push(randChar(DIGITS))
    } else if (ch >= 'A' && ch <= 'Z') {
      chars.push(randChar(UPPER))
    } else if (ch >= 'a' && ch <= 'z') {
      chars.push(randChar(LOWER))
    } else {
      chars.push(ch)
    }
  }
  const result = chars.join('')
  // Retry once if we accidentally generated the same value
  if (result === original) {
    return formatPreserving(original)
  }
  return result
}

function synthesizeEmail(): string {
  const id = randHex(8)
  return `user${id}@example.com`
}

function synthesizeUrl(): string {
  const path = randHex(10)
  return `https://example.com/${path}`
}

function synthesizeIp(): string {
  const a = randInt(1, 254)
  const b = randInt(0, 255)
  const c = randInt(0, 255)
  const d = randInt(1, 254)
  return `${a}.${b}.${c}.${d}`
}

/**
 * Generate a credit card number with valid Luhn checksum,
 * preserving the separator pattern of the original.
 */
function synthesizeCreditCard(original: string): string {
  // Extract only digits from original to know the length
  const digitsOnly = original.replace(/\D/g, '')
  const numDigits = digitsOnly.length

  // Generate random digits (all but the last, which is the Luhn check digit)
  const payload: number[] = []
  for (let i = 0; i < numDigits - 1; i++) {
    payload.push(randInt(0, 9))
  }

  // Calculate Luhn check digit
  let sum = 0
  for (let i = payload.length - 1; i >= 0; i--) {
    let d = payload[i]
    // Double every second digit from right (the check digit position is even, payload last is odd)
    if ((payload.length - 1 - i) % 2 === 0) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  const checkDigit = (10 - (sum % 10)) % 10
  payload.push(checkDigit)

  // Re-insert separators at the same positions as the original
  let digitIdx = 0
  let result = ''
  for (const ch of original) {
    if (ch >= '0' && ch <= '9') {
      result += payload[digitIdx++]
    } else {
      result += ch
    }
  }
  return result
}

/**
 * Generate an IBAN-like value preserving length with a valid mod-97 check.
 */
function synthesizeIban(original: string): string {
  // Preserve the length; use XX country code + random digits
  const stripped = original.replace(/\s/g, '')
  const len = stripped.length
  if (len < 5) return formatPreserving(original)

  // Generate random BBAN digits
  const bbanLen = len - 4
  let bban = ''
  for (let i = 0; i < bbanLen; i++) {
    bban += randChar(DIGITS)
  }

  // Calculate check digits: convert "XX00" + bban to numeric for mod-97
  // Country letters: X=33, so "XX" -> "3333"
  const numericStr = bban + '333300'
  // Compute mod-97 on the numeric string in chunks
  let remainder = 0
  for (const ch of numericStr) {
    remainder = (remainder * 10 + parseInt(ch, 10)) % 97
  }
  const checkDigits = (98 - remainder).toString().padStart(2, '0')

  const iban = 'XX' + checkDigits + bban

  // Re-insert spaces if original had them
  if (original.includes(' ')) {
    let spaceIdx = 0
    let result = ''
    for (const ch of original) {
      if (ch === ' ') {
        result += ' '
      } else {
        result += iban[spaceIdx++] || '0'
      }
    }
    return result
  }

  return iban
}

/**
 * Generate a synthetic replacement for a detected PII value.
 * Uses format-preserving random by default, with specific generators
 * for types where structural validity matters.
 */
export function synthesizeValue(entityType: string, originalText: string): string {
  switch (entityType) {
    case 'Email Address':
      return synthesizeEmail()
    case 'URL':
      return synthesizeUrl()
    case 'IP Address':
      return synthesizeIp()
    case 'Credit Card Number':
      return synthesizeCreditCard(originalText)
    case 'IBAN':
      return synthesizeIban(originalText)
    default:
      return formatPreserving(originalText)
  }
}
