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

/** Validate German Tax ID using ISO 7064 Mod 11,10. */
export function deTaxIdChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  let product = 10
  for (let i = 0; i < 10; i++) {
    let total = (digits[i] + product) % 10
    if (total === 0) total = 10
    product = (total * 2) % 11
  }
  let check = 11 - product
  if (check === 10) check = 0
  return digits[10] === check
}

/** Validate French NIR using mod 97 checksum. */
export function frNirChecksum(number: string): boolean {
  const cleaned = number.toUpperCase().replace(/2A/g, '19').replace(/2B/g, '18')
  let digitsStr = ''
  for (const c of cleaned) {
    if (c >= '0' && c <= '9') digitsStr += c
  }
  if (digitsStr.length !== 15) return false
  const base = parseInt(digitsStr.slice(0, 13), 10)
  const key = parseInt(digitsStr.slice(13, 15), 10)
  return key === 97 - (base % 97)
}

const ES_DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

/** Validate Spanish DNI check letter using mod-23 table. */
export function esDniLetter(number: string): boolean {
  let cleaned = ''
  for (const c of number) {
    if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) cleaned += c
  }
  if (cleaned.length !== 9) return false
  const digitsStr = cleaned.slice(0, 8)
  const letter = cleaned[8].toUpperCase()
  for (const c of digitsStr) {
    if (c < '0' || c > '9') return false
  }
  const expected = ES_DNI_LETTERS[parseInt(digitsStr, 10) % 23]
  return letter === expected
}

/** Validate Spanish NIE check letter (X/Y/Z prefix, then same as DNI). */
export function esNieLetter(number: string): boolean {
  let cleaned = ''
  for (const c of number) {
    if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) cleaned += c
  }
  if (cleaned.length !== 9) return false
  const prefix = cleaned[0].toUpperCase()
  const mapping: Record<string, string> = { X: '0', Y: '1', Z: '2' }
  if (!(prefix in mapping)) return false
  const digitsStr = mapping[prefix] + cleaned.slice(1, 8)
  const letter = cleaned[8].toUpperCase()
  for (const c of digitsStr) {
    if (c < '0' || c > '9') return false
  }
  const expected = ES_DNI_LETTERS[parseInt(digitsStr, 10) % 23]
  return letter === expected
}

const IT_ODD_TABLE: Record<string, number> = {
  '0': 1,
  '1': 0,
  '2': 5,
  '3': 7,
  '4': 9,
  '5': 13,
  '6': 15,
  '7': 17,
  '8': 19,
  '9': 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23,
}

const IT_EVEN_TABLE: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25,
}

/** Validate Italian Codice Fiscale using odd/even position lookup tables. */
export function itCodiceFiscaleCheck(code: string): boolean {
  let cleaned = ''
  for (const c of code) {
    if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) cleaned += c
  }
  cleaned = cleaned.toUpperCase()
  if (cleaned.length !== 16) return false
  let total = 0
  for (let i = 0; i < 15; i++) {
    const c = cleaned[i]
    const val = (i + 1) % 2 === 1 ? IT_ODD_TABLE[c] : IT_EVEN_TABLE[c]
    if (val === undefined) return false
    total += val
  }
  const expected = String.fromCharCode((total % 26) + 'A'.charCodeAt(0))
  return cleaned[15] === expected
}

/** Validate Portuguese NIF using weighted checksum. */
export function ptNifChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 9) return false
  if (![1, 2, 3, 5, 6, 8, 9].includes(digits[0])) return false
  let total = 0
  for (let i = 0; i < 8; i++) {
    total += digits[i] * (9 - i)
  }
  const remainder = total % 11
  const check = remainder < 2 ? 0 : 11 - remainder
  return digits[8] === check
}

/** Validate Polish PESEL using weighted mod-10 checksum. */
export function plPeselChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
  let total = 0
  for (let i = 0; i < 10; i++) {
    total += digits[i] * weights[i]
  }
  const check = (10 - (total % 10)) % 10
  return digits[10] === check
}

/** Validate Polish NIP using weighted mod-11 checksum. */
export function plNipChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 10) return false
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  let total = 0
  for (let i = 0; i < 9; i++) {
    total += digits[i] * weights[i]
  }
  const check = total % 11
  if (check === 10) return false
  return digits[9] === check
}

/** Validate Czech Birth Number: divisible by 11 + month check. */
export function czBirthNumberValid(number: string): boolean {
  const cleaned = number.replace(/[/ ]/g, '')
  for (const c of cleaned) {
    if (c < '0' || c > '9') return false
  }
  if (cleaned.length !== 9 && cleaned.length !== 10) return false
  if (cleaned.length === 10) {
    // Must be divisible by 11
    let remainder = 0
    for (const c of cleaned) {
      remainder = (remainder * 10 + parseInt(c, 10)) % 11
    }
    if (remainder !== 0) return false
  }
  const month = parseInt(cleaned.slice(2, 4), 10)
  let baseMonth = month % 50
  if (baseMonth > 20) baseMonth -= 20
  if (baseMonth < 1 || baseMonth > 12) return false
  return true
}

/** Validate Slovak Birth Number (same logic as Czech). */
export function skBirthNumberValid(number: string): boolean {
  return czBirthNumberValid(number)
}

/** Validate Russian INN using weighted checksum (10 or 12 digits). */
export function ruInnChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length === 10) {
    const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8]
    let total = 0
    for (let i = 0; i < 9; i++) total += digits[i] * weights[i]
    return digits[9] === (total % 11) % 10
  } else if (digits.length === 12) {
    const weights1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
    let total1 = 0
    for (let i = 0; i < 10; i++) total1 += digits[i] * weights1[i]
    const check1 = (total1 % 11) % 10
    if (digits[10] !== check1) return false
    const weights2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
    let total2 = 0
    for (let i = 0; i < 11; i++) total2 += digits[i] * weights2[i]
    const check2 = (total2 % 11) % 10
    return digits[11] === check2
  }
  return false
}

/** Validate Russian SNILS using mod-101 checksum. */
export function ruSnilsChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  let base = 0
  for (let i = 0; i < 9; i++) base = base * 10 + digits[i]
  if (base <= 1001998) return true
  let total = 0
  for (let i = 0; i < 9; i++) total += digits[i] * (9 - i)
  let check = total % 101
  if (check === 100) check = 0
  const checkValue = digits[9] * 10 + digits[10]
  return checkValue === check
}

/** Validate Dutch BSN using the 11-test. */
export function nlBsn11test(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 9) return false
  let total = 0
  for (let i = 0; i < 8; i++) {
    total += digits[i] * (9 - i)
  }
  total -= digits[8]
  return total % 11 === 0 && total !== 0
}

/** Validate Romanian CNP using weighted checksum. */
export function roCnpChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 13) return false
  if (digits[0] < 1 || digits[0] > 8) return false
  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
  let total = 0
  for (let i = 0; i < 12; i++) total += digits[i] * weights[i]
  let check = total % 11
  if (check === 10) check = 1
  return digits[12] === check
}

/** Validate Danish CPR number by checking the date portion. */
export function dkCprValidDate(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 10) return false
  const day = parseInt(digits.slice(0, 2), 10)
  const month = parseInt(digits.slice(2, 4), 10)
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  return true
}

/** Validate Swedish Personnummer using Luhn on last 10 digits. */
export function sePersonnummerLuhn(number: string): boolean {
  let digitsStr = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digitsStr += c
  }
  if (digitsStr.length === 12) digitsStr = digitsStr.slice(2)
  if (digitsStr.length !== 10) return false
  const month = parseInt(digitsStr.slice(2, 4), 10)
  const day = parseInt(digitsStr.slice(4, 6), 10)
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  return luhnChecksum(digitsStr)
}

/** Validate Norwegian Birth Number using dual weighted checksums. */
export function noBirthNumberChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2]
  let total1 = 0
  for (let i = 0; i < 9; i++) total1 += digits[i] * weights1[i]
  let check1 = 11 - (total1 % 11)
  if (check1 === 11) check1 = 0
  if (check1 === 10) return false
  if (digits[9] !== check1) return false
  const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let total2 = 0
  for (let i = 0; i < 10; i++) total2 += digits[i] * weights2[i]
  let check2 = 11 - (total2 % 11)
  if (check2 === 11) check2 = 0
  if (check2 === 10) return false
  return digits[10] === check2
}

/** Validate Brazilian CPF using weighted mod-11 checksum. */
export function brCpfChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  if (new Set(digits).size === 1) return false
  let total1 = 0
  for (let i = 0; i < 9; i++) total1 += digits[i] * (10 - i)
  let check1 = (total1 * 10) % 11
  if (check1 === 10) check1 = 0
  if (digits[9] !== check1) return false
  let total2 = 0
  for (let i = 0; i < 10; i++) total2 += digits[i] * (11 - i)
  let check2 = (total2 * 10) % 11
  if (check2 === 10) check2 = 0
  return digits[10] === check2
}

/** Validate Brazilian CNPJ using weighted mod-11 checksum. */
export function brCnpjChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 14) return false
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let total1 = 0
  for (let i = 0; i < 12; i++) total1 += digits[i] * weights1[i]
  let check1 = total1 % 11
  check1 = check1 < 2 ? 0 : 11 - check1
  if (digits[12] !== check1) return false
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let total2 = 0
  for (let i = 0; i < 13; i++) total2 += digits[i] * weights2[i]
  let check2 = total2 % 11
  check2 = check2 < 2 ? 0 : 11 - check2
  return digits[13] === check2
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
