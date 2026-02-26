// Entity types and match objects for local PII detection

/**
 * PII entity types detected by the regex scanner.
 * Names match the Blindfold API entity types for transparent switching.
 */
export enum EntityType {
  // Universal (always active)
  EMAIL_ADDRESS = 'Email Address',
  CREDIT_CARD = 'Credit Card Number',
  PHONE_NUMBER = 'Phone Number',
  IP_ADDRESS = 'IP Address',
  URL = 'URL',
  MAC_ADDRESS = 'MAC Address',
  DATE_OF_BIRTH = 'Date of Birth',
  CVV = 'CVV',

  // US
  SSN = 'Social Security Number',
  DRIVERS_LICENSE = "Driver's License",
  US_PASSPORT = 'US Passport',
  TAX_ID = 'Tax ID',
  ZIP_CODE = 'ZIP Code',

  // EU
  IBAN = 'IBAN',
  EU_POSTAL_CODE = 'Postal Code',
  VAT_ID = 'VAT ID',

  // UK
  NI_NUMBER = 'NI Number',
  NHS_NUMBER = 'NHS Number',
  UK_POSTCODE = 'UK Postcode',
  UK_PASSPORT = 'UK Passport',

  // Germany (DE)
  DE_PERSONAL_ID = 'German Personal ID',
  DE_TAX_ID = 'German Tax ID',

  // France (FR)
  FR_NATIONAL_ID = 'French National ID',

  // Spain (ES)
  ES_DNI = 'Spanish DNI',
  ES_NIE = 'Spanish NIE',

  // Italy (IT)
  IT_CODICE_FISCALE = 'Italian Codice Fiscale',

  // Portugal (PT)
  PT_NIF = 'Portuguese NIF',

  // Poland (PL)
  PL_PESEL = 'Polish PESEL',
  PL_NIP = 'Polish NIP',

  // Czech Republic (CZ)
  CZ_BIRTH_NUMBER = 'Czech Birth Number',
  CZ_ICO = 'Czech ICO',
  CZ_DIC = 'Czech DIC',
  CZ_BANK_ACCOUNT = 'Czech Bank Account',

  // Russia (RU)
  RU_INN = 'Russian INN',
  RU_SNILS = 'Russian SNILS',

  // Netherlands (NL)
  NL_BSN = 'Dutch BSN',

  // Romania (RO)
  RO_CNP = 'Romanian CNP',

  // Slovakia (SK)
  SK_BIRTH_NUMBER = 'Slovak Birth Number',

  // Denmark (DK)
  DK_CPR = 'Danish CPR',

  // Sweden (SE)
  SE_PERSONNUMMER = 'Swedish Personnummer',

  // Norway (NO)
  NO_BIRTH_NUMBER = 'Norwegian Birth Number',

  // Brazil (BR)
  BR_CPF = 'Brazilian CPF',
  BR_CNPJ = 'Brazilian CNPJ',
}

/** A single PII match found by a detector. */
export interface PIIMatch {
  entityType: string
  text: string
  start: number
  end: number
  score: number
}

/** Short labels used for redaction placeholders, e.g. [EMAIL_ADDRESS] */
export const REDACTION_LABELS: Record<string, string> = {
  [EntityType.EMAIL_ADDRESS]: 'EMAIL_ADDRESS',
  [EntityType.CREDIT_CARD]: 'CREDIT_CARD',
  [EntityType.PHONE_NUMBER]: 'PHONE_NUMBER',
  [EntityType.IP_ADDRESS]: 'IP_ADDRESS',
  [EntityType.URL]: 'URL',
  [EntityType.MAC_ADDRESS]: 'MAC_ADDRESS',
  [EntityType.DATE_OF_BIRTH]: 'DATE_OF_BIRTH',
  [EntityType.CVV]: 'CVV',
  [EntityType.SSN]: 'SSN',
  [EntityType.DRIVERS_LICENSE]: 'DRIVERS_LICENSE',
  [EntityType.US_PASSPORT]: 'US_PASSPORT',
  [EntityType.TAX_ID]: 'TAX_ID',
  [EntityType.ZIP_CODE]: 'ZIP_CODE',
  [EntityType.IBAN]: 'IBAN',
  [EntityType.EU_POSTAL_CODE]: 'POSTAL_CODE',
  [EntityType.VAT_ID]: 'VAT_ID',
  [EntityType.NI_NUMBER]: 'NI_NUMBER',
  [EntityType.NHS_NUMBER]: 'NHS_NUMBER',
  [EntityType.UK_POSTCODE]: 'UK_POSTCODE',
  [EntityType.UK_PASSPORT]: 'UK_PASSPORT',
  [EntityType.DE_PERSONAL_ID]: 'DE_PERSONAL_ID',
  [EntityType.DE_TAX_ID]: 'DE_TAX_ID',
  [EntityType.FR_NATIONAL_ID]: 'FR_NATIONAL_ID',
  [EntityType.ES_DNI]: 'ES_DNI',
  [EntityType.ES_NIE]: 'ES_NIE',
  [EntityType.IT_CODICE_FISCALE]: 'IT_CODICE_FISCALE',
  [EntityType.PT_NIF]: 'PT_NIF',
  [EntityType.PL_PESEL]: 'PL_PESEL',
  [EntityType.PL_NIP]: 'PL_NIP',
  [EntityType.CZ_BIRTH_NUMBER]: 'CZ_BIRTH_NUMBER',
  [EntityType.CZ_ICO]: 'CZ_ICO',
  [EntityType.CZ_DIC]: 'CZ_DIC',
  [EntityType.CZ_BANK_ACCOUNT]: 'CZ_BANK_ACCOUNT',
  [EntityType.RU_INN]: 'RU_INN',
  [EntityType.RU_SNILS]: 'RU_SNILS',
  [EntityType.NL_BSN]: 'NL_BSN',
  [EntityType.RO_CNP]: 'RO_CNP',
  [EntityType.SK_BIRTH_NUMBER]: 'SK_BIRTH_NUMBER',
  [EntityType.DK_CPR]: 'DK_CPR',
  [EntityType.SE_PERSONNUMMER]: 'SE_PERSONNUMMER',
  [EntityType.NO_BIRTH_NUMBER]: 'NO_BIRTH_NUMBER',
  [EntityType.BR_CPF]: 'BR_CPF',
  [EntityType.BR_CNPJ]: 'BR_CNPJ',
}
