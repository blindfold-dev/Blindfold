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
}
