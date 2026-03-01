/**
 * Comprehensive cross-locale tests for the PII scanner.
 *
 * Tests every locale with all its entity types, cross-locale combinations,
 * locale isolation, universal detectors, and all scanner operations.
 *
 * Many detectors have `context_required=true` and only match when a context
 * keyword appears near the PII value. CONTEXT_LABELS maps each entity type
 * to the keyword that satisfies this requirement.
 */

import { PIIScanner } from '../../src/regex'

// ---------------------------------------------------------------------------
// Context labels: the first keyword from each detector's context list.
// Detectors with context_required=true MUST see this keyword to match.
// Detectors with context_required=false still get a score boost from it.
// ---------------------------------------------------------------------------

const CONTEXT_LABELS: Record<string, string> = {
  'Social Security Number': 'ssn',
  'US ITIN': 'itin',
  // IBAN: no context needed
  'UK UTR': 'utr',
  'German Tax ID': 'steuer',
  'German Personal ID': 'personalausweis',
  'French National ID': 'nir',
  'French SIREN': 'siren',
  'Spanish DNI': 'dni',
  'Spanish NIE': 'nie',
  'Spanish NSS': 'nss',
  'Spanish CIF': 'cif',
  'Italian Codice Fiscale': 'codice fiscale',
  'Italian Partita IVA': 'partita iva',
  'Portuguese NIF': 'nif',
  'Polish PESEL': 'pesel',
  'Polish NIP': 'nip',
  'Polish REGON': 'regon',
  'Czech Birth Number': 'rodne cislo',
  'Czech ICO': 'ico',
  'Czech DIC': 'dic',
  'Czech Bank Account': 'ucet',
  'Russian INN': 'inn',
  'Russian SNILS': 'snils',
  'Dutch BSN': 'bsn',
  'Romanian CNP': 'cnp',
  'Romanian CUI': 'cui',
  'Slovak Birth Number': 'rodne cislo',
  'Slovak ICO': 'ico',
  'Slovak DIC': 'dic',
  'Danish CPR': 'cpr',
  'Danish CVR': 'cvr',
  'Swedish Personnummer': 'personnummer',
  'Swedish Organisationsnummer': 'organisationsnummer',
  'Norwegian Birth Number': 'fodselsnummer',
  'Norwegian Organisasjonsnummer': 'organisasjonsnummer',
  'Brazilian CPF': 'cpf',
  'Brazilian CNPJ': 'cnpj',
  'Belgian National Number': 'rijksregisternummer',
  'Belgian Enterprise Number': 'bce',
  'Austrian SVNR': 'svnr',
  'Irish PPS Number': 'pps',
  'Finnish HETU': 'henkilotunnus',
  'Finnish Y-tunnus': 'y-tunnus',
  'Hungarian Tax ID': 'adoazonosito',
  'Hungarian TAJ': 'taj',
  'Bulgarian EGN': 'egn',
  'Croatian OIB': 'oib',
  'Slovenian EMSO': 'emso',
  'Slovenian Tax Number': 'davcna stevilka',
  'Lithuanian Personal Code': 'asmens kodas',
  'Latvian Personal Code': 'personas kods',
  'Estonian Personal Code': 'isikukood',
  'Canadian SIN': 'sin',
  'Swiss AHV': 'ahv',
  'Australian TFN': 'tfn',
  'Australian Medicare': 'medicare',
  'New Zealand IRD': 'ird',
  'Indian Aadhaar': 'aadhaar',
  'Indian PAN': 'pan',
  'Japanese My Number': 'my number',
  'Korean RRN': 'resident registration number',
  'South African ID': 'id number',
  'Turkish Kimlik': 'tc kimlik',
  'Israeli ID': 'teudat zehut',
  'Argentine CUIT': 'cuit',
  'Chilean RUT': 'rut',
  'Colombian NIT': 'nit',
  'Email Address': 'email',
  'Credit Card Number': 'card',
  'IP Address': 'ip',
}

/** Build test text with context keyword preceding the sample value. */
function withContext(entityType: string, sample: string): string {
  const label = CONTEXT_LABELS[entityType]
  if (label) {
    return `${label}: ${sample}`
  }
  return `value: ${sample}`
}

// ---------------------------------------------------------------------------
// Sample PII data per locale (values that pass checksum validation and
// score 1.0 in their respective detector tests).
// ---------------------------------------------------------------------------

interface LocaleSamples {
  [entityType: string]: string
}

const LOCALE_SAMPLES: Record<string, LocaleSamples> = {
  us: {
    'Social Security Number': '123-45-6789',
    'US ITIN': '912-70-1234',
  },
  eu: {
    IBAN: 'DE89370400440532013000',
  },
  uk: {
    'UK UTR': '1123456789',
  },
  de: {
    'German Tax ID': '65929970489',
    'German Personal ID': 'T220001293',
  },
  fr: {
    'French National ID': '185057800608491',
    'French SIREN': '443061841',
  },
  es: {
    'Spanish DNI': '12345678Z',
    'Spanish NIE': 'X1234567L',
    'Spanish NSS': '281234567840',
    'Spanish CIF': 'A58818501',
  },
  it: {
    'Italian Codice Fiscale': 'RSSMRA85T10A562S',
    'Italian Partita IVA': '12345678903',
  },
  pt: {
    'Portuguese NIF': '199999996',
  },
  pl: {
    'Polish PESEL': '44051401359',
    'Polish NIP': '1234563218',
    'Polish REGON': '123456785',
  },
  cz: {
    'Czech Birth Number': '7103192745',
    'Czech ICO': '27864898',
    'Czech DIC': 'CZ27864898',
    'Czech Bank Account': '2000145399/0800',
  },
  ru: {
    'Russian INN': '7707083893',
    'Russian SNILS': '112-233-445 95',
  },
  nl: {
    'Dutch BSN': '111222333',
  },
  ro: {
    'Romanian CNP': '1850501350013',
    'Romanian CUI': '18189442',
  },
  sk: {
    'Slovak Birth Number': '7103192745',
    'Slovak ICO': '31322832',
    'Slovak DIC': 'SK2020317068',
  },
  dk: {
    'Danish CPR': '010190-1234',
    'Danish CVR': '13585628',
  },
  se: {
    'Swedish Personnummer': '811228-9874',
    'Swedish Organisationsnummer': '5567037485',
  },
  no: {
    'Norwegian Birth Number': '01010750160',
    'Norwegian Organisasjonsnummer': '923609016',
  },
  br: {
    'Brazilian CPF': '529.982.247-25',
    'Brazilian CNPJ': '11.222.333/0001-81',
  },
  be: {
    'Belgian National Number': '85.07.30-033.28',
    'Belgian Enterprise Number': '0202.239.951',
  },
  at: {
    'Austrian SVNR': '1237010180',
  },
  ie: {
    'Irish PPS Number': '1234567T',
  },
  fi: {
    'Finnish HETU': '131052-308T',
    'Finnish Y-tunnus': '2077474-0',
  },
  hu: {
    'Hungarian Tax ID': '8071592153',
    'Hungarian TAJ': '123 456 788',
  },
  bg: {
    'Bulgarian EGN': '7523169263',
  },
  hr: {
    'Croatian OIB': '69435151530',
  },
  si: {
    'Slovenian EMSO': '0101006500006',
    'Slovenian Tax Number': 'SI15012557',
  },
  lt: {
    'Lithuanian Personal Code': '38903110814',
  },
  lv: {
    'Latvian Personal Code': '321291-16749',
  },
  ee: {
    'Estonian Personal Code': '37605030299',
  },
  ca: {
    'Canadian SIN': '046 454 286',
  },
  ch: {
    'Swiss AHV': '756.1234.5678.97',
  },
  au: {
    'Australian TFN': '123 456 782',
    'Australian Medicare': '2123 45670 1',
  },
  nz: {
    'New Zealand IRD': '49-091-850',
  },
  in: {
    'Indian Aadhaar': '2345 6789 0124',
    'Indian PAN': 'ABCPD1234E',
  },
  jp: {
    'Japanese My Number': '1234 5678 9018',
  },
  kr: {
    'Korean RRN': '900101-1234568',
  },
  za: {
    'South African ID': '8001015009087',
  },
  tr: {
    'Turkish Kimlik': '10000000146',
  },
  il: {
    'Israeli ID': '031456783',
  },
  ar: {
    'Argentine CUIT': '20-12345678-6',
  },
  cl: {
    'Chilean RUT': '12.345.678-5',
  },
  co: {
    'Colombian NIT': '900.123.456-8',
  },
}

const ALL_LOCALES = Object.keys(LOCALE_SAMPLES).sort()

// ===================================================================
// 1. Per-locale detection: each locale detects all its entity types
// ===================================================================

describe('Per-locale detection', () => {
  for (const locale of ALL_LOCALES) {
    describe(`locale: ${locale}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const samples = LOCALE_SAMPLES[locale]

      for (const [entityType, sample] of Object.entries(samples)) {
        test(`detects ${entityType}`, () => {
          const text = withContext(entityType, sample)
          const matches = scanner.detect(text, [entityType])
          const found = matches.filter((m) => m.entityType === entityType)
          expect(found.length).toBeGreaterThanOrEqual(1)
        })

        test(`${entityType} matches correct text`, () => {
          const text = withContext(entityType, `${sample} here`)
          const matches = scanner.detect(text, [entityType])
          const found = matches.filter((m) => m.entityType === entityType)
          if (found.length > 0) {
            expect(sample.includes(found[0].text) || found[0].text.includes(sample)).toBe(true)
          }
        })
      }
    })
  }
})

// ===================================================================
// 2. Universal detectors: work regardless of locale
// ===================================================================

describe('Universal detectors across locales', () => {
  for (const locale of ALL_LOCALES) {
    test(`Email detected with locale ${locale}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const matches = scanner.detect('Contact user@example.com please', ['Email Address'])
      const emails = matches.filter((m) => m.entityType === 'Email Address')
      expect(emails.length).toBe(1)
    })

    test(`Credit Card detected with locale ${locale}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const matches = scanner.detect('Card 4532015112830366', ['Credit Card Number'])
      const cc = matches.filter((m) => m.entityType === 'Credit Card Number')
      expect(cc.length).toBe(1)
    })

    test(`IP Address detected with locale ${locale}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const matches = scanner.detect('Server IP: 192.168.1.100', ['IP Address'])
      const ips = matches.filter((m) => m.entityType === 'IP Address')
      expect(ips.length).toBe(1)
    })
  }
})

// ===================================================================
// 3. Locale isolation: locale X must not detect locale Y's entities
// ===================================================================

interface IsolationPair {
  homeLocale: string
  entityType: string
  sample: string
  foreignLocale: string
}

const ISOLATION_PAIRS: IsolationPair[] = [
  { homeLocale: 'us', entityType: 'Social Security Number', sample: '123-45-6789', foreignLocale: 'eu' },
  { homeLocale: 'us', entityType: 'Social Security Number', sample: '123-45-6789', foreignLocale: 'uk' },
  { homeLocale: 'us', entityType: 'Social Security Number', sample: '123-45-6789', foreignLocale: 'de' },
  { homeLocale: 'eu', entityType: 'IBAN', sample: 'DE89370400440532013000', foreignLocale: 'us' },
  { homeLocale: 'eu', entityType: 'IBAN', sample: 'DE89370400440532013000', foreignLocale: 'br' },
  { homeLocale: 'de', entityType: 'German Tax ID', sample: '65929970489', foreignLocale: 'fr' },
  { homeLocale: 'de', entityType: 'German Tax ID', sample: '65929970489', foreignLocale: 'es' },
  { homeLocale: 'fr', entityType: 'French National ID', sample: '185057800608491', foreignLocale: 'de' },
  { homeLocale: 'fr', entityType: 'French SIREN', sample: '443061841', foreignLocale: 'it' },
  { homeLocale: 'es', entityType: 'Spanish DNI', sample: '12345678Z', foreignLocale: 'fr' },
  { homeLocale: 'es', entityType: 'Spanish DNI', sample: '12345678Z', foreignLocale: 'de' },
  { homeLocale: 'it', entityType: 'Italian Codice Fiscale', sample: 'RSSMRA85T10A562S', foreignLocale: 'es' },
  { homeLocale: 'br', entityType: 'Brazilian CPF', sample: '529.982.247-25', foreignLocale: 'us' },
  { homeLocale: 'br', entityType: 'Brazilian CPF', sample: '529.982.247-25', foreignLocale: 'ar' },
  { homeLocale: 'pl', entityType: 'Polish PESEL', sample: '44051401359', foreignLocale: 'cz' },
  { homeLocale: 'cz', entityType: 'Czech Birth Number', sample: '7103192745', foreignLocale: 'pl' },
  { homeLocale: 'ru', entityType: 'Russian INN', sample: '7707083893', foreignLocale: 'de' },
  { homeLocale: 'ca', entityType: 'Canadian SIN', sample: '046 454 286', foreignLocale: 'us' },
  { homeLocale: 'au', entityType: 'Australian TFN', sample: '123 456 782', foreignLocale: 'nz' },
  { homeLocale: 'in', entityType: 'Indian PAN', sample: 'ABCPD1234E', foreignLocale: 'us' },
  { homeLocale: 'jp', entityType: 'Japanese My Number', sample: '1234 5678 9018', foreignLocale: 'kr' },
  { homeLocale: 'kr', entityType: 'Korean RRN', sample: '900101-1234568', foreignLocale: 'jp' },
  { homeLocale: 'za', entityType: 'South African ID', sample: '8001015009087', foreignLocale: 'us' },
  { homeLocale: 'tr', entityType: 'Turkish Kimlik', sample: '10000000146', foreignLocale: 'il' },
  { homeLocale: 'ar', entityType: 'Argentine CUIT', sample: '20-12345678-6', foreignLocale: 'cl' },
  { homeLocale: 'cl', entityType: 'Chilean RUT', sample: '12.345.678-5', foreignLocale: 'co' },
  { homeLocale: 'se', entityType: 'Swedish Personnummer', sample: '811228-9874', foreignLocale: 'no' },
  { homeLocale: 'no', entityType: 'Norwegian Birth Number', sample: '01010750160', foreignLocale: 'se' },
  { homeLocale: 'dk', entityType: 'Danish CPR', sample: '010190-1234', foreignLocale: 'fi' },
  { homeLocale: 'fi', entityType: 'Finnish HETU', sample: '131052-308T', foreignLocale: 'dk' },
  { homeLocale: 'be', entityType: 'Belgian National Number', sample: '85.07.30-033.28', foreignLocale: 'nl' },
  { homeLocale: 'nl', entityType: 'Dutch BSN', sample: '111222333', foreignLocale: 'be' },
  { homeLocale: 'hu', entityType: 'Hungarian Tax ID', sample: '8071592153', foreignLocale: 'bg' },
  { homeLocale: 'bg', entityType: 'Bulgarian EGN', sample: '7523169263', foreignLocale: 'hr' },
  { homeLocale: 'hr', entityType: 'Croatian OIB', sample: '69435151530', foreignLocale: 'si' },
  { homeLocale: 'si', entityType: 'Slovenian EMSO', sample: '0101006500006', foreignLocale: 'hr' },
  { homeLocale: 'lt', entityType: 'Lithuanian Personal Code', sample: '38903110814', foreignLocale: 'lv' },
  { homeLocale: 'lv', entityType: 'Latvian Personal Code', sample: '321291-16749', foreignLocale: 'ee' },
  { homeLocale: 'ee', entityType: 'Estonian Personal Code', sample: '37605030299', foreignLocale: 'lt' },
  { homeLocale: 'at', entityType: 'Austrian SVNR', sample: '1237010180', foreignLocale: 'ch' },
  { homeLocale: 'ch', entityType: 'Swiss AHV', sample: '756.1234.5678.97', foreignLocale: 'at' },
  { homeLocale: 'ie', entityType: 'Irish PPS Number', sample: '1234567T', foreignLocale: 'uk' },
  { homeLocale: 'nz', entityType: 'New Zealand IRD', sample: '49-091-850', foreignLocale: 'au' },
  { homeLocale: 'co', entityType: 'Colombian NIT', sample: '900.123.456-8', foreignLocale: 'ar' },
  { homeLocale: 'il', entityType: 'Israeli ID', sample: '031456783', foreignLocale: 'tr' },
]

describe('Locale isolation', () => {
  for (const { homeLocale, entityType, sample, foreignLocale } of ISOLATION_PAIRS) {
    test(`${foreignLocale} does not detect ${entityType} (belongs to ${homeLocale})`, () => {
      const scanner = new PIIScanner({ locales: [foreignLocale] })
      // Use context from the home entity so the value has context, but the
      // foreign locale should still not detect it because it lacks the detector.
      const text = withContext(entityType, sample)
      const matches = scanner.detect(text, [entityType])
      const found = matches.filter((m) => m.entityType === entityType)
      expect(found.length).toBe(0)
    })
  }
})

// ===================================================================
// 4. Multi-locale combinations
// ===================================================================

describe('Multi-locale combinations', () => {
  test('US + EU + UK', () => {
    const scanner = new PIIScanner({ locales: ['us', 'eu', 'uk'] })
    const text = 'ssn 123-45-6789, IBAN DE89370400440532013000, utr 1123456789'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Social Security Number')).toBe(true)
    expect(types.has('IBAN')).toBe(true)
  })

  test('EU with country locales (DE, FR, ES)', () => {
    const scanner = new PIIScanner({ locales: ['eu', 'de', 'fr', 'es'] })
    const text =
      'IBAN DE89370400440532013000 ' +
      'steuer 65929970489 ' +
      'nir 185057800608491 ' +
      'dni 12345678Z'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('IBAN')).toBe(true)
    expect(types.has('German Tax ID')).toBe(true)
    expect(types.has('French National ID')).toBe(true)
    expect(types.has('Spanish DNI')).toBe(true)
  })

  test('Latin America (BR, AR, CL, CO)', () => {
    const scanner = new PIIScanner({ locales: ['br', 'ar', 'cl', 'co'] })
    const text =
      'cpf 529.982.247-25 ' +
      'cuit 20-12345678-6 ' +
      'rut 12.345.678-5 ' +
      'nit 900.123.456-8'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Brazilian CPF')).toBe(true)
    expect(types.has('Argentine CUIT')).toBe(true)
    expect(types.has('Chilean RUT')).toBe(true)
    expect(types.has('Colombian NIT')).toBe(true)
  })

  test('Nordic (DK, SE, NO, FI)', () => {
    const scanner = new PIIScanner({ locales: ['dk', 'se', 'no', 'fi'] })
    const text =
      'cpr 010190-1234 ' +
      'personnummer 811228-9874 ' +
      'fodselsnummer 01010750160 ' +
      'henkilotunnus 131052-308T'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Danish CPR')).toBe(true)
    expect(types.has('Swedish Personnummer')).toBe(true)
    expect(types.has('Norwegian Birth Number')).toBe(true)
    expect(types.has('Finnish HETU')).toBe(true)
  })

  test('Central Europe (CZ, SK, PL, HU)', () => {
    const scanner = new PIIScanner({ locales: ['cz', 'sk', 'pl', 'hu'] })
    const text =
      'rodne cislo 7103192745 ' +
      'ico 31322832 ' +
      'pesel 44051401359 ' +
      'taj 123 456 788'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Czech Birth Number') || types.has('Slovak Birth Number')).toBe(true)
    expect(types.has('Polish PESEL')).toBe(true)
    expect(types.has('Hungarian TAJ')).toBe(true)
  })

  test('Asia-Pacific (AU, NZ, IN, JP, KR)', () => {
    const scanner = new PIIScanner({ locales: ['au', 'nz', 'in', 'jp', 'kr'] })
    const text =
      'tfn 123 456 782 ' +
      'ird 49-091-850 ' +
      'aadhaar 2345 6789 0124 ' +
      'my number 1234 5678 9018 ' +
      'resident registration number 900101-1234568'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Australian TFN')).toBe(true)
    expect(types.has('New Zealand IRD')).toBe(true)
    expect(types.has('Indian Aadhaar')).toBe(true)
    expect(types.has('Japanese My Number')).toBe(true)
    expect(types.has('Korean RRN')).toBe(true)
  })

  test('Baltics (LT, LV, EE)', () => {
    const scanner = new PIIScanner({ locales: ['lt', 'lv', 'ee'] })
    const text =
      'asmens kodas 38903110814 ' +
      'personas kods 321291-16749 ' +
      'isikukood 37605030299'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Lithuanian Personal Code')).toBe(true)
    expect(types.has('Latvian Personal Code')).toBe(true)
    expect(types.has('Estonian Personal Code')).toBe(true)
  })

  test('Balkans (BG, HR, SI, RO)', () => {
    const scanner = new PIIScanner({ locales: ['bg', 'hr', 'si', 'ro'] })
    const text =
      'egn 7523169263 ' +
      'oib 69435151530 ' +
      'emso 0101006500006 ' +
      'cnp 1850501350013'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Bulgarian EGN')).toBe(true)
    expect(types.has('Croatian OIB')).toBe(true)
    expect(types.has('Slovenian EMSO')).toBe(true)
    expect(types.has('Romanian CNP')).toBe(true)
  })

  test('all locales loaded at once detects entities from each major region', () => {
    const allLocales = Object.keys(LOCALE_SAMPLES)
    const scanner = new PIIScanner({ locales: allLocales })
    const text =
      'ssn 123-45-6789 ' +
      'IBAN DE89370400440532013000 ' +
      'cpf 529.982.247-25 ' +
      'dni 12345678Z ' +
      'pesel 44051401359 ' +
      'email user@example.com'
    const matches = scanner.detect(text)
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('Social Security Number')).toBe(true)
    expect(types.has('IBAN')).toBe(true)
    expect(types.has('Brazilian CPF')).toBe(true)
    expect(types.has('Spanish DNI')).toBe(true)
    expect(types.has('Polish PESEL')).toBe(true)
    expect(types.has('Email Address')).toBe(true)
  })
})

// ===================================================================
// 5. All scanner operations per locale
// ===================================================================

interface OperationLocale {
  locale: string
  entityType: string
  sample: string
}

const OPERATION_LOCALES: OperationLocale[] = [
  { locale: 'us', entityType: 'Social Security Number', sample: '123-45-6789' },
  { locale: 'eu', entityType: 'IBAN', sample: 'DE89370400440532013000' },
  { locale: 'de', entityType: 'German Tax ID', sample: '65929970489' },
  { locale: 'fr', entityType: 'French National ID', sample: '185057800608491' },
  { locale: 'es', entityType: 'Spanish DNI', sample: '12345678Z' },
  { locale: 'br', entityType: 'Brazilian CPF', sample: '529.982.247-25' },
  { locale: 'cz', entityType: 'Czech Birth Number', sample: '7103192745' },
  { locale: 'pl', entityType: 'Polish PESEL', sample: '44051401359' },
  { locale: 'se', entityType: 'Swedish Personnummer', sample: '811228-9874' },
  { locale: 'au', entityType: 'Australian TFN', sample: '123 456 782' },
  { locale: 'in', entityType: 'Indian Aadhaar', sample: '2345 6789 0124' },
  { locale: 'jp', entityType: 'Japanese My Number', sample: '1234 5678 9018' },
  { locale: 'kr', entityType: 'Korean RRN', sample: '900101-1234568' },
  { locale: 'ar', entityType: 'Argentine CUIT', sample: '20-12345678-6' },
  { locale: 'it', entityType: 'Italian Codice Fiscale', sample: 'RSSMRA85T10A562S' },
  { locale: 'dk', entityType: 'Danish CPR', sample: '010190-1234' },
  { locale: 'no', entityType: 'Norwegian Birth Number', sample: '01010750160' },
  { locale: 'nl', entityType: 'Dutch BSN', sample: '111222333' },
  { locale: 'ro', entityType: 'Romanian CNP', sample: '1850501350013' },
  { locale: 'bg', entityType: 'Bulgarian EGN', sample: '7523169263' },
  { locale: 'hr', entityType: 'Croatian OIB', sample: '69435151530' },
  { locale: 'ca', entityType: 'Canadian SIN', sample: '046 454 286' },
  { locale: 'ch', entityType: 'Swiss AHV', sample: '756.1234.5678.97' },
  { locale: 'za', entityType: 'South African ID', sample: '8001015009087' },
  { locale: 'tr', entityType: 'Turkish Kimlik', sample: '10000000146' },
]

describe('Redact per locale', () => {
  for (const { locale, entityType, sample } of OPERATION_LOCALES) {
    test(`${locale}: redact removes ${entityType}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = `${withContext(entityType, sample)} end`
      const [redacted, matches] = scanner.redact(text, [entityType])
      expect(redacted).not.toContain(sample)
      expect(matches.filter((m) => m.entityType === entityType).length).toBeGreaterThanOrEqual(1)
    })
  }
})

describe('Tokenize per locale', () => {
  for (const { locale, entityType, sample } of OPERATION_LOCALES) {
    test(`${locale}: tokenize replaces ${entityType}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = `${withContext(entityType, sample)} end`
      const result = scanner.tokenize(text, [entityType])
      expect(result.text).not.toContain(sample)
      const token = `<${entityType}_1>`
      expect(result.text).toContain(token)
      expect(result.mapping[token]).toBeDefined()
    })
  }
})

describe('Mask per locale', () => {
  for (const { locale, entityType, sample } of OPERATION_LOCALES) {
    test(`${locale}: mask hides ${entityType}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = `${withContext(entityType, sample)} end`
      const result = scanner.mask(text, 3, false, '*', [entityType])
      expect(result.text).not.toContain(sample)
      expect(result.text).toContain('*')
    })
  }
})

describe('Hash per locale', () => {
  for (const { locale, entityType, sample } of OPERATION_LOCALES) {
    test(`${locale}: hash replaces ${entityType}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = `${withContext(entityType, sample)} end`
      const result = scanner.hash(text, 'sha256', 'HASH_', 16, [entityType])
      expect(result.text).not.toContain(sample)
      expect(result.text).toContain('HASH_')
    })

    test(`${locale}: hash is deterministic for ${entityType}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = `${withContext(entityType, sample)} end`
      const r1 = scanner.hash(text, 'sha256', 'HASH_', 16, [entityType])
      const r2 = scanner.hash(text, 'sha256', 'HASH_', 16, [entityType])
      expect(r1.text).toBe(r2.text)
    })
  }
})

describe('Encrypt per locale', () => {
  const key = 'my-secret-key-1234567890'

  for (const { locale, entityType, sample } of OPERATION_LOCALES) {
    test(`${locale}: encrypt replaces ${entityType}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = `${withContext(entityType, sample)} end`
      const result = scanner.encrypt(text, key, [entityType])
      expect(result.text).not.toContain(sample)
    })
  }
})

describe('Synthesize per locale', () => {
  for (const { locale, entityType, sample } of OPERATION_LOCALES) {
    test(`${locale}: synthesize runs for ${entityType}`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = `${withContext(entityType, sample)} end`
      const result = scanner.synthesize(text, undefined, [entityType])
      // Some entities may not have a synthesizer, so the original value
      // could still appear. We only assert that the operation ran and
      // matches were found.
      expect(result.matches.length).toBeGreaterThanOrEqual(1)
      expect(result.matches.some((m) => m.entityType === entityType)).toBe(true)
    })
  }
})

// ===================================================================
// 6. Method-level entity filtering across locales
// ===================================================================

describe('Method-level entity filtering cross-locale', () => {
  test('filter single entity from multi-locale scanner', () => {
    const scanner = new PIIScanner({ locales: ['us', 'eu', 'de'] })
    const text = 'ssn 123-45-6789 IBAN DE89370400440532013000 steuer 65929970489'
    const matches = scanner.detect(text, ['Social Security Number'])
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.size).toBe(1)
    expect(types.has('Social Security Number')).toBe(true)
  })

  test('filter two entities from multi-locale scanner', () => {
    const scanner = new PIIScanner({ locales: ['us', 'eu', 'de'] })
    const text = 'ssn 123-45-6789 IBAN DE89370400440532013000 steuer 65929970489'
    const matches = scanner.detect(text, ['IBAN', 'German Tax ID'])
    const types = new Set(matches.map((m) => m.entityType))
    expect(types.has('IBAN')).toBe(true)
    expect(types.has('German Tax ID')).toBe(true)
    expect(types.has('Social Security Number')).toBe(false)
  })

  test('filtering entity not in loaded locales returns empty', () => {
    const scanner = new PIIScanner({ locales: ['us'] })
    const matches = scanner.detect('IBAN DE89370400440532013000', ['IBAN'])
    expect(matches.length).toBe(0)
  })

  test('redact with entity filter in multi-locale', () => {
    const scanner = new PIIScanner({ locales: ['us', 'eu'] })
    const text = 'ssn 123-45-6789 and IBAN DE89370400440532013000'
    const [redacted] = scanner.redact(text, ['Social Security Number'])
    expect(redacted).not.toContain('123-45-6789')
    expect(redacted).toContain('DE89370400440532013000')
  })

  test('tokenize with entity filter in multi-locale', () => {
    const scanner = new PIIScanner({ locales: ['br', 'ar'] })
    const text = 'cpf 529.982.247-25 cuit 20-12345678-6'
    const result = scanner.tokenize(text, ['Brazilian CPF'])
    expect(result.text).toContain('<Brazilian CPF_1>')
    expect(result.text).toContain('20-12345678-6')
  })

  test('mask with entity filter in multi-locale', () => {
    const scanner = new PIIScanner({ locales: ['de', 'fr'] })
    const text = 'steuer 65929970489 nir 185057800608491'
    const result = scanner.mask(text, 3, false, '*', ['German Tax ID'])
    expect(result.text).toContain('185057800608491')
    expect(result.text).not.toContain('65929970489')
  })

  test('hash with entity filter in multi-locale', () => {
    const scanner = new PIIScanner({ locales: ['es', 'it'] })
    const text = 'dni 12345678Z codice fiscale RSSMRA85T10A562S'
    const result = scanner.hash(text, 'sha256', 'HASH_', 16, ['Spanish DNI'])
    expect(result.text).toContain('RSSMRA85T10A562S')
    expect(result.text).not.toContain('12345678Z')
  })
})

// ===================================================================
// 7. Score validation
// ===================================================================

describe('Score validation for checksum-verified entities', () => {
  const VALIDATED_ENTITIES: OperationLocale[] = [
    { locale: 'us', entityType: 'Social Security Number', sample: '123-45-6789' },
    { locale: 'eu', entityType: 'IBAN', sample: 'DE89370400440532013000' },
    { locale: 'br', entityType: 'Brazilian CPF', sample: '529.982.247-25' },
    { locale: 'br', entityType: 'Brazilian CNPJ', sample: '11.222.333/0001-81' },
    { locale: 'cz', entityType: 'Czech Birth Number', sample: '7103192745' },
    { locale: 'pl', entityType: 'Polish PESEL', sample: '44051401359' },
    { locale: 'pl', entityType: 'Polish NIP', sample: '1234563218' },
    { locale: 'bg', entityType: 'Bulgarian EGN', sample: '7523169263' },
    { locale: 'hr', entityType: 'Croatian OIB', sample: '69435151530' },
    { locale: 'ee', entityType: 'Estonian Personal Code', sample: '37605030299' },
    { locale: 'lt', entityType: 'Lithuanian Personal Code', sample: '38903110814' },
    { locale: 'au', entityType: 'Australian TFN', sample: '123 456 782' },
    { locale: 'ca', entityType: 'Canadian SIN', sample: '046 454 286' },
    { locale: 'ch', entityType: 'Swiss AHV', sample: '756.1234.5678.97' },
    { locale: 'es', entityType: 'Spanish DNI', sample: '12345678Z' },
    { locale: 'it', entityType: 'Italian Codice Fiscale', sample: 'RSSMRA85T10A562S' },
    { locale: 'nl', entityType: 'Dutch BSN', sample: '111222333' },
    { locale: 'ro', entityType: 'Romanian CNP', sample: '1850501350013' },
    { locale: 'se', entityType: 'Swedish Personnummer', sample: '811228-9874' },
    { locale: 'no', entityType: 'Norwegian Birth Number', sample: '01010750160' },
    { locale: 'de', entityType: 'German Tax ID', sample: '65929970489' },
    { locale: 'fi', entityType: 'Finnish HETU', sample: '131052-308T' },
    { locale: 'hu', entityType: 'Hungarian Tax ID', sample: '8071592153' },
    { locale: 'il', entityType: 'Israeli ID', sample: '031456783' },
    { locale: 'tr', entityType: 'Turkish Kimlik', sample: '10000000146' },
    { locale: 'za', entityType: 'South African ID', sample: '8001015009087' },
    { locale: 'kr', entityType: 'Korean RRN', sample: '900101-1234568' },
    { locale: 'jp', entityType: 'Japanese My Number', sample: '1234 5678 9018' },
    { locale: 'ar', entityType: 'Argentine CUIT', sample: '20-12345678-6' },
    { locale: 'cl', entityType: 'Chilean RUT', sample: '12.345.678-5' },
  ]

  for (const { locale, entityType, sample } of VALIDATED_ENTITIES) {
    test(`${locale}: ${entityType} scores 1.0`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      const text = withContext(entityType, sample)
      const matches = scanner.detect(text, [entityType])
      const found = matches.filter((m) => m.entityType === entityType)
      expect(found.length).toBeGreaterThanOrEqual(1)
      expect(found[0].score).toBe(1.0)
    })
  }
})

// ===================================================================
// 8. Edge cases
// ===================================================================

describe('Edge cases', () => {
  for (const locale of ALL_LOCALES) {
    test(`${locale}: empty text returns no matches`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      expect(scanner.detect('')).toEqual([])
    })

    test(`${locale}: clean text returns no matches`, () => {
      const scanner = new PIIScanner({ locales: [locale] })
      expect(scanner.detect('This is a normal sentence with no PII.')).toEqual([])
    })
  }

  test('multiple same-type tokens are numbered', () => {
    const scanner = new PIIScanner({ locales: ['us'] })
    const result = scanner.tokenize('Email a@b.com and c@d.com', ['Email Address'])
    expect(result.text).toContain('<Email Address_1>')
    expect(result.text).toContain('<Email Address_2>')
  })

  test('all locales can be loaded simultaneously', () => {
    const allLocales = Object.keys(LOCALE_SAMPLES)
    const scanner = new PIIScanner({ locales: allLocales })
    expect(scanner.detect('user@example.com').length).toBeGreaterThanOrEqual(1)
  })

  test('duplicate locale does not duplicate detectors', () => {
    const s1 = new PIIScanner({ locales: ['us'] })
    const s2 = new PIIScanner({ locales: ['us', 'us'] })
    // Both should produce the same detection results for identical text
    const text = 'ssn 123-45-6789 email user@example.com'
    const m1 = s1.detect(text)
    const m2 = s2.detect(text)
    // Compare detected entity types and values rather than raw counts,
    // since deduplication handles overlaps identically
    const key = (m: { entityType: string; text: string }) => `${m.entityType}:${m.text}`
    const set1 = new Set(m1.map(key))
    const set2 = new Set(m2.map(key))
    expect(set1).toEqual(set2)
  })
})
