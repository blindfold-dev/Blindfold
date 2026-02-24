// Validation functions for PII entities (Luhn, IBAN mod-97, SSN, NHS)

/** Validate a number string using the Luhn algorithm (ISO/IEC 7812). */
export function luhnChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') {
      digits.push(parseInt(c, 10))
    }
  }
  if (digits.length < 2) {
    return false
  }
  let total = 0
  const reversed = digits.slice().reverse()
  for (let i = 0; i < reversed.length; i++) {
    let d = reversed[i]
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) {
        d -= 9
      }
    }
    total += d
  }
  return total % 10 === 0
}

/** Validate IBAN using ISO 7064 mod-97 checksum. */
export function ibanMod97(iban: string): boolean {
  const cleaned = iban.replace(/[\s-]/g, '').toUpperCase()
  if (cleaned.length < 5) {
    return false
  }
  if (!/^[A-Z]{2}/.test(cleaned) || !/^\d{2}/.test(cleaned.slice(2, 4))) {
    return false
  }
  // Move first 4 characters to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  let numeric = ''
  for (const c of rearranged) {
    if (c >= '0' && c <= '9') {
      numeric += c
    } else if (c >= 'A' && c <= 'Z') {
      numeric += String(c.charCodeAt(0) - 55)
    } else {
      return false
    }
  }
  // Use modular arithmetic to avoid BigInt issues with large numbers.
  // Process the numeric string in chunks.
  let remainder = 0
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + parseInt(numeric[i], 10)) % 97
  }
  return remainder === 1
}

/** Check SSN format rules: no 000/666/9xx area, no 00 group, no 0000 serial. */
export function ssnValidFormat(ssn: string): boolean {
  let digits = ''
  for (const c of ssn) {
    if (c >= '0' && c <= '9') {
      digits += c
    }
  }
  if (digits.length !== 9) {
    return false
  }
  const area = parseInt(digits.slice(0, 3), 10)
  const group = parseInt(digits.slice(3, 5), 10)
  const serial = parseInt(digits.slice(5), 10)
  if (area === 0 || area === 666 || area >= 900) {
    return false
  }
  if (group === 0) {
    return false
  }
  if (serial === 0) {
    return false
  }
  return true
}

/** Validate NHS number using modulus 11 checksum. */
export function nhsChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') {
      digits.push(parseInt(c, 10))
    }
  }
  if (digits.length !== 10) {
    return false
  }
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 9; i++) {
    total += digits[i] * weights[i]
  }
  const remainder = total % 11
  let checkDigit = 11 - remainder
  if (checkDigit === 11) {
    checkDigit = 0
  }
  if (checkDigit === 10) {
    return false
  }
  return digits[9] === checkDigit
}
