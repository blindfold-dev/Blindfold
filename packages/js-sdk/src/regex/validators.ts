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

/** Validate Czech ICO (Company ID) using mod-11 weighted checksum. */
export function czIcoChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 8) return false
  const weights = [8, 7, 6, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 7; i++) {
    total += digits[i] * weights[i]
  }
  const remainder = total % 11
  let check: number
  if (remainder === 0) check = 1
  else if (remainder === 1) check = 0
  else check = 11 - remainder
  return digits[7] === check
}

/** Validate Czech DIC (Tax/VAT ID): CZ prefix + ICO or birth number checksum. */
export function czDicValid(number: string): boolean {
  let cleaned = number.trim()
  if (cleaned.toUpperCase().startsWith('CZ')) {
    cleaned = cleaned.slice(2)
  }
  if (!/^\d+$/.test(cleaned)) return false
  if (cleaned.length === 8) {
    return czIcoChecksum(cleaned)
  }
  if (cleaned.length === 10) {
    let remainder = 0
    for (const c of cleaned) {
      remainder = (remainder * 10 + parseInt(c, 10)) % 11
    }
    return remainder === 0
  }
  if (cleaned.length === 9) {
    const month = parseInt(cleaned.slice(2, 4), 10)
    let baseMonth = month % 50
    if (baseMonth > 20) baseMonth -= 20
    return baseMonth >= 1 && baseMonth <= 12
  }
  return false
}

/** Validate Czech bank account number using mod-11 weighted checksum. */
export function czBankAccountValid(number: string): boolean {
  const parts = number.split('/')
  if (parts.length !== 2) return false
  const bankCode = parts[1]
  if (!/^\d{4}$/.test(bankCode)) return false
  const accountPart = parts[0]
  let prefix = ''
  let account = accountPart
  if (accountPart.includes('-')) {
    const split = accountPart.split('-')
    if (split.length !== 2) return false
    prefix = split[0]
    account = split[1]
  }
  if (!/^\d{1,6}$/.test(prefix) && prefix !== '') return false
  if (!/^\d{2,10}$/.test(account)) return false
  const weights = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1]
  // Validate account number
  const accDigits = account.padStart(10, '0').split('').map(Number)
  let total = 0
  for (let i = 0; i < 10; i++) total += accDigits[i] * weights[i]
  if (total % 11 !== 0) return false
  // Validate prefix if present
  if (prefix !== '') {
    const prefDigits = prefix.padStart(6, '0').split('').map(Number)
    const prefWeights = weights.slice(4) // [10, 5, 8, 4, 2, 1]
    let prefTotal = 0
    for (let i = 0; i < 6; i++) prefTotal += prefDigits[i] * prefWeights[i]
    if (prefTotal % 11 !== 0) return false
  }
  // Disambiguate: if no prefix and account is 6 digits (YYMMDD), the match
  // could be a Czech birth number (YYMMDD/XXXX). Prefer birth number.
  if (prefix === '' && account.length === 6 && czBirthNumberValid(number)) {
    return false
  }
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

/** Validate US ITIN format: 9XX-[7X|8X|9X|70-88]-XXXX. */
export function usItinValid(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 9) return false
  if (digits[0] !== '9') return false
  const d4 = parseInt(digits[3], 10)
  if (d4 < 7) return false
  return true
}

/** Validate UK UTR using mod-11 weighted checksum. */
export function ukUtrChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 10) return false
  const weights = [6, 7, 8, 9, 10, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 9; i++) total += digits[i + 1] * weights[i]
  const remainder = total % 11
  const check = 11 - remainder === 10 ? 0 : 11 - remainder
  return digits[0] === check || (11 - remainder === 11 && digits[0] === 0)
}

/** Validate Spanish NSS using mod-97 checksum. */
export function esNssChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 12) return false
  const province = parseInt(digits.slice(0, 2), 10)
  if (province < 1 || province > 53) return false
  const baseNum = parseInt(digits.slice(0, 10), 10)
  const check = parseInt(digits.slice(10, 12), 10)
  return baseNum % 97 === check
}

/** Validate Spanish CIF using custom checksum. */
export function esCifChecksum(number: string): boolean {
  let cleaned = ''
  for (const c of number) {
    if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) cleaned += c
  }
  cleaned = cleaned.toUpperCase()
  if (cleaned.length !== 9) return false
  const letter = cleaned[0]
  if (!'ABCDEFGHJNPQRSUVW'.includes(letter)) return false
  let totalEven = 0
  let totalOdd = 0
  for (let i = 1; i <= 7; i++) {
    const d = parseInt(cleaned[i], 10)
    if (isNaN(d)) return false
    if (i % 2 === 0) {
      totalEven += d
    } else {
      const doubled = d * 2
      totalOdd += Math.floor(doubled / 10) + (doubled % 10)
    }
  }
  const total = totalEven + totalOdd
  const checkDigit = (10 - (total % 10)) % 10
  const control = cleaned[8]
  if ('KPQS'.includes(letter)) {
    return control === String.fromCharCode('A'.charCodeAt(0) + checkDigit)
  }
  if ('ABEH'.includes(letter)) {
    return control === String(checkDigit)
  }
  return control === String(checkDigit) || control === String.fromCharCode('A'.charCodeAt(0) + checkDigit)
}

/** Validate Italian Partita IVA using Luhn-like algorithm. */
export function itPartitaIvaChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  if (digits.every(d => d === 0)) return false
  let total = 0
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      total += digits[i]
    } else {
      const doubled = digits[i] * 2
      total += doubled > 9 ? doubled - 9 : doubled
    }
  }
  const check = (10 - (total % 10)) % 10
  return digits[10] === check
}

/** Validate Polish REGON using mod-11 weighted checksum (9 or 14 digits). */
export function plRegonChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length === 9) {
    const weights = [8, 9, 2, 3, 4, 5, 6, 7]
    let total = 0
    for (let i = 0; i < 8; i++) total += digits[i] * weights[i]
    const check = total % 11 === 10 ? 0 : total % 11
    return digits[8] === check
  }
  if (digits.length === 14) {
    const weights9 = [8, 9, 2, 3, 4, 5, 6, 7]
    let total9 = 0
    for (let i = 0; i < 8; i++) total9 += digits[i] * weights9[i]
    const check9 = total9 % 11 === 10 ? 0 : total9 % 11
    if (digits[8] !== check9) return false
    const weights14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8]
    let total14 = 0
    for (let i = 0; i < 13; i++) total14 += digits[i] * weights14[i]
    const check14 = total14 % 11 === 10 ? 0 : total14 % 11
    return digits[13] === check14
  }
  return false
}

/** Validate Slovak ICO using same algorithm as Czech ICO. */
export function skIcoChecksum(number: string): boolean {
  return czIcoChecksum(number)
}

/** Validate Slovak DIC: SK prefix + digits divisible by 11. */
export function skDicValid(number: string): boolean {
  let cleaned = number.trim()
  if (cleaned.toUpperCase().startsWith('SK')) cleaned = cleaned.slice(2)
  if (!/^\d{10}$/.test(cleaned)) return false
  let remainder = 0
  for (const c of cleaned) {
    remainder = (remainder * 10 + parseInt(c, 10)) % 11
  }
  return remainder === 0
}

/** Validate Romanian CUI using mod-11 weighted checksum. */
export function roCuiChecksum(number: string): boolean {
  let cleaned = number.trim().toUpperCase()
  if (cleaned.startsWith('RO')) cleaned = cleaned.slice(2)
  const digits: number[] = []
  for (const c of cleaned) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length < 2 || digits.length > 10) return false
  const weights = [7, 5, 3, 2, 1, 7, 5, 3, 2]
  const padded = Array(10 - digits.length).fill(0).concat(digits)
  const check = padded.pop()!
  let total = 0
  for (let i = 0; i < 9; i++) total += padded[i] * weights[i]
  const expected = (total * 10) % 11 === 10 ? 0 : (total * 10) % 11
  return check === expected
}

/** Validate Danish CVR using mod-11 weighted checksum. */
export function dkCvrChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 8) return false
  const weights = [2, 7, 6, 5, 4, 3, 2, 1]
  let total = 0
  for (let i = 0; i < 8; i++) total += digits[i] * weights[i]
  return total % 11 === 0
}

/** Validate Swedish Organisationsnummer using Luhn on 10 digits. */
export function seOrgnrChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 10) return false
  const d3 = parseInt(digits[2], 10)
  if (d3 < 2) return false
  return luhnChecksum(digits)
}

/** Validate Norwegian Organisasjonsnummer using mod-11 weighted checksum. */
export function noOrgnrChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 9) return false
  const weights = [3, 2, 7, 6, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 8; i++) total += digits[i] * weights[i]
  const remainder = total % 11
  if (remainder === 1) return false
  const check = remainder === 0 ? 0 : 11 - remainder
  return digits[8] === check
}

/** Validate Belgian National Number using mod-97 checksum. */
export function beNationalNumberChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 11) return false
  const base = parseInt(digits.slice(0, 9), 10)
  const check = parseInt(digits.slice(9, 11), 10)
  if (97 - (base % 97) === check) return true
  const base2000 = parseInt('2' + digits.slice(0, 9), 10)
  return 97 - (base2000 % 97) === check
}

/** Validate Belgian Enterprise Number using mod-97 checksum. */
export function beEnterpriseChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 10) return false
  if (digits[0] !== '0' && digits[0] !== '1') return false
  const base = parseInt(digits.slice(0, 8), 10)
  const check = parseInt(digits.slice(8, 10), 10)
  return 97 - (base % 97) === check
}

/** Validate Austrian SVNR (Social Insurance Number). */
export function atSvnrChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 10) return false
  const weights = [3, 7, 9, 0, 5, 8, 4, 2, 1, 6]
  let total = 0
  for (let i = 0; i < 10; i++) total += digits[i] * weights[i]
  return total % 11 === digits[3]
}

/** Validate Irish PPS Number using mod-23 checksum. */
export function iePpsChecksum(number: string): boolean {
  let cleaned = ''
  for (const c of number) {
    if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) cleaned += c
  }
  cleaned = cleaned.toUpperCase()
  if (cleaned.length < 8 || cleaned.length > 9) return false
  let total = 0
  for (let i = 0; i < 7; i++) {
    const d = parseInt(cleaned[i], 10)
    if (isNaN(d)) return false
    total += d * (8 - i)
  }
  if (cleaned.length === 9 && cleaned[8] >= 'A' && cleaned[8] <= 'Z') {
    total += (cleaned[8].charCodeAt(0) - 64) * 9
  }
  const remainder = total % 23
  const expected = remainder === 0 ? 'W' : String.fromCharCode('A'.charCodeAt(0) + remainder - 1)
  return cleaned[7] === expected
}

/** Validate Finnish HETU (Personal Identity Code) using mod-31 checksum. */
export function fiHetuChecksum(number: string): boolean {
  let cleaned = number.replace(/[\s-]/g, '')
  // Fallback: if stripping removed the separator, use the trimmed original
  if (cleaned.length !== 11) cleaned = number.trim()
  if (cleaned.length !== 11) return false
  const datePart = cleaned.slice(0, 6)
  for (const c of datePart) {
    if (c < '0' || c > '9') return false
  }
  const sep = cleaned[6]
  if (!'-+ABCDEFYXWVU'.includes(sep)) return false
  const numPart = cleaned.slice(7, 10)
  for (const c of numPart) {
    if (c < '0' || c > '9') return false
  }
  const checkChars = '0123456789ABCDEFHJKLMNPRSTUVWXY'
  const combined = parseInt(datePart + numPart, 10)
  const expected = checkChars[combined % 31]
  return cleaned[10].toUpperCase() === expected
}

/** Validate Finnish Y-tunnus (Business ID) using mod-11 weighted checksum. */
export function fiYtunnusChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 8) return false
  const weights = [7, 9, 10, 5, 8, 4, 2]
  let total = 0
  for (let i = 0; i < 7; i++) total += parseInt(digits[i], 10) * weights[i]
  const remainder = total % 11
  if (remainder === 1) return false
  const check = remainder === 0 ? 0 : 11 - remainder
  return parseInt(digits[7], 10) === check
}

/** Validate Hungarian Tax ID using mod-11 weighted checksum. */
export function huTaxIdChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 10) return false
  if (digits[0] !== 8) return false
  const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  let total = 0
  for (let i = 0; i < 9; i++) total += digits[i] * weights[i]
  return digits[9] === total % 11
}

/** Validate Hungarian TAJ (Social Security) using mod-10 with 3/7 weights. */
export function huTajChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 9) return false
  let total = 0
  for (let i = 0; i < 8; i++) {
    total += digits[i] * (i % 2 === 0 ? 3 : 7)
  }
  return digits[8] === total % 10
}

/** Validate Bulgarian EGN using weighted mod-11 checksum. */
export function bgEgnChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 10) return false
  const month = parseInt(number.slice(2, 4), 10)
  const baseMonth = month > 40 ? month - 40 : month > 20 ? month - 20 : month
  if (baseMonth < 1 || baseMonth > 12) return false
  const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6]
  let total = 0
  for (let i = 0; i < 9; i++) total += digits[i] * weights[i]
  let check = total % 11
  if (check === 10) check = 0
  return digits[9] === check
}

/** Validate Croatian OIB using ISO 7064 MOD 11,2. */
export function hrOibChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  let remainder = 10
  for (let i = 0; i < 10; i++) {
    remainder = (remainder + digits[i]) % 10
    if (remainder === 0) remainder = 10
    remainder = (remainder * 2) % 11
  }
  let check = 11 - remainder
  if (check === 10) check = 0
  return digits[10] === check
}

/** Validate Slovenian EMSO using mod-11 weighted checksum. */
export function siEmsoChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 13) return false
  const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 12; i++) total += digits[i] * weights[i]
  const remainder = total % 11
  const check = remainder === 0 ? 0 : 11 - remainder
  if (check === 10) return false
  return digits[12] === check
}

/** Validate Slovenian Tax Number using mod-11. */
export function siTaxNumberChecksum(number: string): boolean {
  let cleaned = number.trim().toUpperCase()
  if (cleaned.startsWith('SI')) cleaned = cleaned.slice(2)
  const digits: number[] = []
  for (const c of cleaned) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 8) return false
  const weights = [8, 7, 6, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 7; i++) total += digits[i] * weights[i]
  const remainder = total % 11
  if (remainder === 0 || remainder === 1) return digits[7] === 0
  return digits[7] === 11 - remainder
}

/** Validate Lithuanian Personal Code using dual-pass mod-11 checksum. */
export function ltPersonalCodeChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  if (digits[0] < 1 || digits[0] > 6) return false
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1]
  let total = 0
  for (let i = 0; i < 10; i++) total += digits[i] * weights1[i]
  let check = total % 11
  if (check === 10) {
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3]
    total = 0
    for (let i = 0; i < 10; i++) total += digits[i] * weights2[i]
    check = total % 11
    if (check === 10) check = 0
  }
  return digits[10] === check
}

/** Validate Latvian Personal Code (old format with checksum). */
export function lvPersonalCodeChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 11) return false
  const day = parseInt(digits.slice(0, 2), 10)
  const month = parseInt(digits.slice(2, 4), 10)
  if (digits[0] === '3' && digits[1] === '2') {
    return true
  }
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  const weights = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  let total = 0
  for (let i = 0; i < 10; i++) total += parseInt(digits[i], 10) * weights[i]
  const check = ((1101 - total) % 11) % 10
  return parseInt(digits[10], 10) === check
}

/** Validate Estonian Personal Code using dual-pass mod-11 checksum. */
export function eePersonalCodeChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  if (digits[0] < 1 || digits[0] > 6) return false
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1]
  let total = 0
  for (let i = 0; i < 10; i++) total += digits[i] * weights1[i]
  let check = total % 11
  if (check === 10) {
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3]
    total = 0
    for (let i = 0; i < 10; i++) total += digits[i] * weights2[i]
    check = total % 11
    if (check === 10) check = 0
  }
  return digits[10] === check
}

/** Validate Swiss AHV using EAN-13 checksum. */
export function chAhvChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 13) return false
  if (!digits.startsWith('756')) return false
  let total = 0
  for (let i = 0; i < 12; i++) {
    total += parseInt(digits[i], 10) * (i % 2 === 0 ? 1 : 3)
  }
  const check = (10 - (total % 10)) % 10
  return parseInt(digits[12], 10) === check
}

/** Validate Australian TFN using mod-11 weighted checksum. */
export function auTfnChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 9 && digits.length !== 8) return false
  if (digits.length === 8) {
    const weights = [10, 7, 8, 4, 6, 3, 5, 1]
    let total = 0
    for (let i = 0; i < 8; i++) total += digits[i] * weights[i]
    return total % 11 === 0
  }
  const weights = [1, 4, 3, 7, 5, 8, 6, 9, 10]
  let total = 0
  for (let i = 0; i < 9; i++) total += digits[i] * weights[i]
  return total % 11 === 0
}

/** Validate Australian Medicare number using mod-10 weighted checksum. */
export function auMedicareChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length < 10 || digits.length > 11) return false
  const weights = [1, 3, 7, 9, 1, 3, 7, 9]
  let total = 0
  for (let i = 0; i < 8; i++) total += parseInt(digits[i], 10) * weights[i]
  return parseInt(digits[8], 10) === total % 10
}

/** Validate New Zealand IRD using dual-pass mod-11 checksum. */
export function nzIrdChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 8 && digits.length !== 9) return false
  if (digits.length === 8) digits = '0' + digits
  const d = digits.split('').map(Number)
  const weights1 = [3, 2, 7, 6, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 8; i++) total += d[i] * weights1[i]
  const remainder = total % 11
  if (remainder === 0) return d[8] === 0
  if (11 - remainder !== 10) return d[8] === 11 - remainder
  const weights2 = [7, 4, 3, 2, 5, 2, 7, 6]
  total = 0
  for (let i = 0; i < 8; i++) total += d[i] * weights2[i]
  const r2 = total % 11
  if (r2 === 0) return d[8] === 0
  return d[8] === 11 - r2
}

// Verhoeff lookup tables
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

/** Validate Indian Aadhaar using Verhoeff algorithm. */
export function inAadhaarChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 12) return false
  if (digits[0] === '0' || digits[0] === '1') return false
  let c = 0
  for (let i = digits.length - 1; i >= 0; i--) {
    c = VERHOEFF_D[c][VERHOEFF_P[(digits.length - 1 - i) % 8][parseInt(digits[i], 10)]]
  }
  return c === 0
}

/** Validate Indian PAN format: AAAAA0000A. */
export function inPanValid(number: string): boolean {
  const cleaned = number.trim().toUpperCase()
  if (cleaned.length !== 10) return false
  return /^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/.test(cleaned)
}

/** Validate Japanese My Number using mod-11 checksum. */
export function jpMyNumberChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 12) return false
  let total = 0
  for (let i = 0; i < 11; i++) {
    const p = 11 - i
    const q = p <= 6 ? p + 1 : p - 5
    total += parseInt(digits[i], 10) * q
  }
  const remainder = total % 11
  const check = remainder <= 1 ? 0 : 11 - remainder
  return parseInt(digits[11], 10) === check
}

/** Validate Korean RRN using weighted mod checksum. */
export function krRrnChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 13) return false
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
  let total = 0
  for (let i = 0; i < 12; i++) total += parseInt(digits[i], 10) * weights[i]
  const check = (11 - (total % 11)) % 10
  return parseInt(digits[12], 10) === check
}

/** Validate Turkish Kimlik using custom dual check digit algorithm. */
export function trKimlikChecksum(number: string): boolean {
  const digits: number[] = []
  for (const c of number) {
    if (c >= '0' && c <= '9') digits.push(parseInt(c, 10))
  }
  if (digits.length !== 11) return false
  if (digits[0] === 0) return false
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
  const check1 = ((oddSum * 7) - evenSum) % 10
  if (check1 < 0 ? check1 + 10 : check1 !== digits[9]) return false
  let total = 0
  for (let i = 0; i < 10; i++) total += digits[i]
  return total % 10 === digits[10]
}

/** Validate Argentine CUIT using mod-11 weighted checksum. */
export function arCuitChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length !== 11) return false
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let total = 0
  for (let i = 0; i < 10; i++) total += parseInt(digits[i], 10) * weights[i]
  const remainder = total % 11
  const check = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder
  return parseInt(digits[10], 10) === check
}

/** Validate Chilean RUT using mod-11 checksum with K. */
export function clRutChecksum(number: string): boolean {
  let cleaned = number.replace(/[.\s]/g, '').toUpperCase()
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-')
    if (parts.length !== 2) return false
    cleaned = parts[0] + parts[1]
  }
  if (cleaned.length < 2) return false
  const body = cleaned.slice(0, -1)
  const check = cleaned.slice(-1)
  if (!/^\d+$/.test(body)) return false
  let total = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    total += parseInt(body[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const remainder = 11 - (total % 11)
  let expected: string
  if (remainder === 11) expected = '0'
  else if (remainder === 10) expected = 'K'
  else expected = String(remainder)
  return check === expected
}

/** Validate Colombian NIT using mod-11 with prime-based weights. */
export function coNitChecksum(number: string): boolean {
  let digits = ''
  for (const c of number) {
    if (c >= '0' && c <= '9') digits += c
  }
  if (digits.length < 8 || digits.length > 10) return false
  const body = digits.slice(0, -1)
  const check = parseInt(digits.slice(-1), 10)
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
  let total = 0
  for (let i = 0; i < body.length; i++) {
    total += parseInt(body[body.length - 1 - i], 10) * weights[i]
  }
  const remainder = total % 11
  const expected = remainder === 0 ? 0 : remainder === 1 ? 1 : 11 - remainder
  return check === expected
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
