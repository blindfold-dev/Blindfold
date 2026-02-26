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

  // US (additional)
  US_ITIN = 'US ITIN',

  // UK (additional)
  UK_UTR = 'UK UTR',

  // France (additional)
  FR_SIREN = 'French SIREN',

  // Spain (additional)
  ES_NSS = 'Spanish NSS',
  ES_CIF = 'Spanish CIF',

  // Italy (additional)
  IT_PARTITA_IVA = 'Italian Partita IVA',

  // Poland (additional)
  PL_REGON = 'Polish REGON',

  // Slovakia (additional)
  SK_ICO = 'Slovak ICO',
  SK_DIC = 'Slovak DIC',

  // Romania (additional)
  RO_CUI = 'Romanian CUI',

  // Denmark (additional)
  DK_CVR = 'Danish CVR',

  // Sweden (additional)
  SE_ORGNR = 'Swedish Organisationsnummer',

  // Norway (additional)
  NO_ORGNR = 'Norwegian Organisasjonsnummer',

  // Belgium (BE)
  BE_NATIONAL_NUMBER = 'Belgian National Number',
  BE_ENTERPRISE_NUMBER = 'Belgian Enterprise Number',

  // Austria (AT)
  AT_SVNR = 'Austrian SVNR',

  // Ireland (IE)
  IE_PPS = 'Irish PPS Number',

  // Finland (FI)
  FI_HETU = 'Finnish HETU',
  FI_YTUNNUS = 'Finnish Y-tunnus',

  // Hungary (HU)
  HU_TAX_ID = 'Hungarian Tax ID',
  HU_TAJ = 'Hungarian TAJ',

  // Bulgaria (BG)
  BG_EGN = 'Bulgarian EGN',

  // Croatia (HR)
  HR_OIB = 'Croatian OIB',

  // Slovenia (SI)
  SI_EMSO = 'Slovenian EMSO',
  SI_TAX_NUMBER = 'Slovenian Tax Number',

  // Lithuania (LT)
  LT_PERSONAL_CODE = 'Lithuanian Personal Code',

  // Latvia (LV)
  LV_PERSONAL_CODE = 'Latvian Personal Code',

  // Estonia (EE)
  EE_PERSONAL_CODE = 'Estonian Personal Code',

  // Canada (CA)
  CA_SIN = 'Canadian SIN',

  // Switzerland (CH)
  CH_AHV = 'Swiss AHV',

  // Australia (AU)
  AU_TFN = 'Australian TFN',
  AU_MEDICARE = 'Australian Medicare',

  // New Zealand (NZ)
  NZ_IRD = 'New Zealand IRD',

  // India (IN)
  IN_AADHAAR = 'Indian Aadhaar',
  IN_PAN = 'Indian PAN',

  // Japan (JP)
  JP_MY_NUMBER = 'Japanese My Number',

  // South Korea (KR)
  KR_RRN = 'Korean RRN',

  // South Africa (ZA)
  ZA_ID = 'South African ID',

  // Turkey (TR)
  TR_KIMLIK = 'Turkish Kimlik',

  // Israel (IL)
  IL_ID = 'Israeli ID',

  // Argentina (AR)
  AR_CUIT = 'Argentine CUIT',

  // Chile (CL)
  CL_RUT = 'Chilean RUT',

  // Colombia (CO)
  CO_NIT = 'Colombian NIT',
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
  [EntityType.US_ITIN]: 'US_ITIN',
  [EntityType.UK_UTR]: 'UK_UTR',
  [EntityType.FR_SIREN]: 'FR_SIREN',
  [EntityType.ES_NSS]: 'ES_NSS',
  [EntityType.ES_CIF]: 'ES_CIF',
  [EntityType.IT_PARTITA_IVA]: 'IT_PARTITA_IVA',
  [EntityType.PL_REGON]: 'PL_REGON',
  [EntityType.SK_ICO]: 'SK_ICO',
  [EntityType.SK_DIC]: 'SK_DIC',
  [EntityType.RO_CUI]: 'RO_CUI',
  [EntityType.DK_CVR]: 'DK_CVR',
  [EntityType.SE_ORGNR]: 'SE_ORGNR',
  [EntityType.NO_ORGNR]: 'NO_ORGNR',
  [EntityType.BE_NATIONAL_NUMBER]: 'BE_NATIONAL_NUMBER',
  [EntityType.BE_ENTERPRISE_NUMBER]: 'BE_ENTERPRISE_NUMBER',
  [EntityType.AT_SVNR]: 'AT_SVNR',
  [EntityType.IE_PPS]: 'IE_PPS',
  [EntityType.FI_HETU]: 'FI_HETU',
  [EntityType.FI_YTUNNUS]: 'FI_YTUNNUS',
  [EntityType.HU_TAX_ID]: 'HU_TAX_ID',
  [EntityType.HU_TAJ]: 'HU_TAJ',
  [EntityType.BG_EGN]: 'BG_EGN',
  [EntityType.HR_OIB]: 'HR_OIB',
  [EntityType.SI_EMSO]: 'SI_EMSO',
  [EntityType.SI_TAX_NUMBER]: 'SI_TAX_NUMBER',
  [EntityType.LT_PERSONAL_CODE]: 'LT_PERSONAL_CODE',
  [EntityType.LV_PERSONAL_CODE]: 'LV_PERSONAL_CODE',
  [EntityType.EE_PERSONAL_CODE]: 'EE_PERSONAL_CODE',
  [EntityType.CA_SIN]: 'CA_SIN',
  [EntityType.CH_AHV]: 'CH_AHV',
  [EntityType.AU_TFN]: 'AU_TFN',
  [EntityType.AU_MEDICARE]: 'AU_MEDICARE',
  [EntityType.NZ_IRD]: 'NZ_IRD',
  [EntityType.IN_AADHAAR]: 'IN_AADHAAR',
  [EntityType.IN_PAN]: 'IN_PAN',
  [EntityType.JP_MY_NUMBER]: 'JP_MY_NUMBER',
  [EntityType.KR_RRN]: 'KR_RRN',
  [EntityType.ZA_ID]: 'ZA_ID',
  [EntityType.TR_KIMLIK]: 'TR_KIMLIK',
  [EntityType.IL_ID]: 'IL_ID',
  [EntityType.AR_CUIT]: 'AR_CUIT',
  [EntityType.CL_RUT]: 'CL_RUT',
  [EntityType.CO_NIT]: 'CO_NIT',
}
