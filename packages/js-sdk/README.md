# Blindfold JS SDK

Detect, redact, tokenize, and mask PII in JavaScript/TypeScript. 80+ entity types, 30+ countries, works offline with zero dependencies.

[![npm version](https://img.shields.io/npm/v/@blindfold/sdk)](https://www.npmjs.com/package/@blindfold/sdk)
[![License](https://img.shields.io/npm/l/@blindfold/sdk)](https://github.com/blindfold-dev/blindfold/blob/main/LICENSE)

## Why Blindfold?

- **Works offline, zero dependencies** — No API key needed for local detection. No network calls. No external packages.
- **80+ PII entity types** across 30+ countries with checksum validation (Luhn, IBAN mod-97, Verhoeff, etc.)
- **85x faster than Presidio** — 0.4s vs 34s on 3,000 samples ([benchmark](https://blindfold.dev/blog/pii-detection-benchmark))
- **Higher accuracy** — F1 58.6% vs Presidio 38.8% on AI4Privacy multilingual benchmark
- **8 operations**: detect, redact, tokenize, detokenize, mask, hash, encrypt, synthesize
- **Compliance-ready** — Built-in GDPR, HIPAA, PCI-DSS policies
- **Optional NLP upgrade** — Add API key to detect names, addresses, organizations (60+ additional entities)
- **Batch processing**, typed errors, full TypeScript support

## Quick Comparison

| Feature | Blindfold | Presidio | regex-only |
|---|---|---|---|
| Entity types (local) | 80+ | ~20 | Custom |
| Countries | 30+ | ~5 | Custom |
| Checksum validation | Luhn, mod-97, Verhoeff, ... | Partial | No |
| Speed (3K samples) | 0.4s | 34s | Varies |
| Zero dependencies | Yes | No (spaCy) | Yes |
| NLP upgrade path | Yes (API) | Yes (built-in) | No |
| Tokenize/detokenize | Yes | No | No |

## Common Use Cases

- **Sanitize LLM prompts** — Strip PII before sending to OpenAI, Anthropic, etc.
- **PII-safe RAG pipelines** — Redact before embedding, restore after retrieval
- **Log scrubbing** — Anonymize data in logs and data pipelines
- **GDPR/HIPAA compliance** — Built-in policies for AI applications
- **Synthetic test data** — Format-preserving fake data generation

## Install

```bash
npm install @blindfold/sdk
# or
yarn add @blindfold/sdk
# or
pnpm add @blindfold/sdk
```

## Quick Start (no API key needed)

```typescript
import { Blindfold } from '@blindfold/sdk'

const client = new Blindfold()

// Detect PII locally — no API key, no network call
const result = await client.detect("Email john@acme.com, SSN 123-45-6789")
for (const entity of result.detected_entities) {
  console.log(`${entity.type}: ${entity.text} (score: ${entity.score})`)
}
// Email Address: john@acme.com (score: 0.95)
// Social Security Number: 123-45-6789 (score: 1.0)

// Redact PII locally
const redacted = await client.redact("Email john@acme.com, SSN 123-45-6789")
console.log(redacted.text)
// "Email, SSN"
```

## Upgrade to Blindfold API (optional)

For names, addresses, organizations, and 60+ entity types, add your API key:

1. Sign up at [blindfold.dev](https://www.blindfold.dev/)
2. Get your API key at [app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys)
3. Set environment variable: `BLINDFOLD_API_KEY=sk-***`

```typescript
// With API key — auto-switches to NLP-powered API
const client = new Blindfold({ apiKey: 'sk-...' })
const result = await client.detect("John Smith lives at 123 Oak Street")
```

## Initialization

```typescript
import { Blindfold } from '@blindfold/sdk'

// Local mode (no API key) — regex-based detection
const client = new Blindfold()

// API mode (with API key) — NLP-powered detection
const client = new Blindfold({ apiKey: 'sk-...' })

// Force local mode even with an API key (useful for latency-critical paths)
const client = new Blindfold({ apiKey: 'sk-...', mode: 'local' })
```

## Operations

### Tokenize (Reversible)

Replace sensitive data with reversible tokens (e.g., `<Person_1>`).

```typescript
const response = await client.tokenize(
  "Contact John Doe at john@example.com",
  {
    policy: 'gdpr_eu',  // Optional: 'hipaa_us', 'basic', 'pci_dss', 'strict'
    entities: ['person', 'email address'],  // Optional: filter entities
    score_threshold: 0.4  // Optional: confidence threshold
  }
)

console.log(response.text)
// "Contact <Person_1> at <Email Address_1>"

console.log(response.mapping)
// { "<Person_1>": "John Doe", "<Email Address_1>": "john@example.com" }
```

### Detokenize

Restore original values from tokens. Runs **client-side** — no API call.

```typescript
// No await needed — runs locally!
const original = client.detokenize(
  "AI response for <Person_1>",
  response.mapping
)
console.log(original.text)
// "AI response for John Doe"
```

### Redact

Permanently remove sensitive data.

```typescript
const response = await client.redact(
  "My password is secret123",
  { entities: ['person', 'email address'] }
)
```

### Mask

Partially hide sensitive data (e.g., `****-****-****-1234`).

```typescript
const response = await client.mask(
  "Credit card: 4532-7562-9102-3456",
  { masking_char: '*', chars_to_show: 4, from_end: true }
)
console.log(response.text)
// "Credit card: ***************3456"
```

### Hash

Replace data with deterministic hashes (useful for analytics/matching).

```typescript
const response = await client.hash(
  "User ID: 12345",
  { hash_type: 'sha256', hash_prefix: 'ID_' }
)
```

### Encrypt

Encrypt sensitive data using AES (reversible with key).

```typescript
const response = await client.encrypt(
  "Secret message",
  { encryption_key: 'your-secure-key-min-16-chars' }
)
```

### Synthesize

Replace real data with realistic fake data. Works offline with format-preserving generation.

```typescript
// Works offline — no API key required
const client = new Blindfold()
const response = await client.synthesize("Email john@acme.com, SSN 123-45-6789")
console.log(response.text)
// "Email user3a9f1b2c@example.com, SSN 847-29-3156"

// With API key — NLP-powered synthesis (names, addresses, etc.)
const response = await client.synthesize(
  "John lives in New York",
  { language: 'en' }
)
console.log(response.text)
// "Michael lives in Boston"
```

## Batch Processing

Process multiple texts in a single request (max 100 texts):

```typescript
const result = await client.tokenizeBatch(
  ["Contact John Doe", "jane@example.com", "No PII here"],
  { policy: "gdpr_eu" }
)

console.log(result.total)      // 3
console.log(result.succeeded)  // 3
console.log(result.failed)     // 0

result.results.forEach(item => console.log(item.text))
```

All methods have batch variants: `tokenizeBatch`, `detectBatch`, `redactBatch`, `maskBatch`, `synthesizeBatch`, `hashBatch`, `encryptBatch`.

## Local PII Scanner

The built-in regex scanner works offline with zero dependencies. Use it directly for fine-grained control:

```typescript
import { PIIScanner, EntityType } from '@blindfold/sdk/regex'

// Default: US locale
const scanner = new PIIScanner()
const matches = scanner.detect("Call me at john@acme.com or 555-867-5309")

for (const match of matches) {
  console.log(`${match.entityType}: ${match.text} (score: ${match.score})`)
}

// Redact PII
const { text, matches: redacted } = scanner.redact("SSN 123-45-6789, CC 4532015112830366")
console.log(text)
// "SSN, CC"
```

### Multi-locale support

```typescript
// US + EU entities
const scanner = new PIIScanner({ locales: ['us', 'eu'] })
const matches = scanner.detect("SSN 123-45-6789, IBAN DE89370400440532013000")

// UK entities
const scanner = new PIIScanner({ locales: ['uk'] })
const matches = scanner.detect("NI number: AB 12 34 56 A")

// All locales
const scanner = new PIIScanner({ locales: ['us', 'eu', 'uk'] })
```

### Filter by entity type

```typescript
// Only detect emails and credit cards
const scanner = new PIIScanner({ entities: [EntityType.EMAIL, EntityType.CREDIT_CARD] })
```

## Error Handling

```typescript
import { AuthenticationError, APIError, NetworkError } from '@blindfold/sdk'

try {
  await client.tokenize("...")
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle invalid API key
  } else if (error instanceof APIError) {
    // Handle API error (e.g. validation)
  } else if (error instanceof NetworkError) {
    // Handle network issues
  }
}
```

<details>
<summary><strong>Supported local entity types (80+)</strong></summary>

| Entity Type | Locale | Validation |
|---|---|---|
| Email Address | Universal | RFC 5322 pattern |
| Credit Card Number | Universal | Luhn checksum |
| Phone Number | Universal | Format + digit count |
| IP Address (v4/v6) | Universal | Octet range |
| URL | Universal | TLD validation |
| MAC Address | Universal | Pattern |
| Date of Birth | Universal | Context-required |
| CVV/CVC | Universal | Context-required |
| Social Security Number | US | Format rules + context |
| Driver's License | US | Multi-state formats + context |
| US Passport | US | Context-required |
| Tax ID / EIN | US | Prefix validation + context |
| ZIP Code | US | Context-required + validator |
| US ITIN | US | Format validation |
| IBAN | EU | ISO 7064 mod-97 checksum |
| Postal Code | EU | DE/FR/NL patterns |
| VAT ID | EU | Country prefix + format |
| UK NI Number | UK | Format validation |
| UK NHS Number | UK | Modulus-11 checksum |
| UK Postcode | UK | Pattern |
| UK Passport | UK | Context-required |
| UK UTR | UK | Mod-11 checksum |
| German Personal ID | DE | Context-required |
| German Tax ID | DE | Check digit |
| French National ID (NIR) | FR | Check digit |
| French SIREN | FR | Luhn checksum |
| Spanish DNI | ES | Letter validation |
| Spanish NIE | ES | Letter validation |
| Spanish NSS | ES | Mod-97 checksum |
| Spanish CIF | ES | Custom checksum |
| Italian Codice Fiscale | IT | Check digit |
| Italian Partita IVA | IT | Luhn-like checksum |
| Portuguese NIF | PT | Check digit |
| Dutch BSN | NL | Modulus-11 check |
| Belgian National Number | BE | Mod-97 checksum |
| Belgian Enterprise Number | BE | Mod-97 checksum |
| Austrian SVNR | AT | Mod-11 checksum |
| Swiss AHV | CH | EAN-13 checksum |
| Irish PPS Number | IE | Mod-23 checksum |
| Polish PESEL | PL | Check digit |
| Polish NIP | PL | Check digit |
| Polish REGON | PL | Mod-11 checksum |
| Czech Birth Number | CZ | Modulus validation |
| Czech ICO (Company ID) | CZ | Mod-11 weighted checksum |
| Czech DIC (Tax/VAT ID) | CZ | ICO checksum / mod-11 |
| Czech Bank Account | CZ | Mod-11 weighted checksum |
| Slovak Birth Number | SK | Modulus validation |
| Slovak ICO | SK | Mod-11 weighted checksum |
| Slovak DIC | SK | Mod-11 divisibility |
| Romanian CNP | RO | Check digit |
| Romanian CUI | RO | Mod-11 checksum |
| Danish CPR | DK | Date validation |
| Danish CVR | DK | Mod-11 checksum |
| Swedish Personnummer | SE | Luhn algorithm |
| Swedish Organisationsnummer | SE | Luhn algorithm |
| Norwegian Birth Number | NO | Check digit |
| Norwegian Organisasjonsnummer | NO | Mod-11 checksum |
| Finnish HETU | FI | Mod-31 checksum |
| Finnish Y-tunnus | FI | Mod-11 checksum |
| Hungarian Tax ID | HU | Mod-11 checksum |
| Hungarian TAJ | HU | Mod-10 checksum |
| Bulgarian EGN | BG | Mod-11 checksum |
| Croatian OIB | HR | ISO 7064 MOD 11,2 |
| Slovenian EMSO | SI | Mod-11 checksum |
| Slovenian Tax Number | SI | Mod-11 checksum |
| Lithuanian Personal Code | LT | Dual-pass mod-11 |
| Latvian Personal Code | LV | Weighted checksum |
| Estonian Personal Code | EE | Dual-pass mod-11 |
| Russian INN | RU | Check digit |
| Russian SNILS | RU | Check digit |
| Canadian SIN | CA | Luhn checksum |
| Australian TFN | AU | Mod-11 checksum |
| Australian Medicare | AU | Mod-10 checksum |
| New Zealand IRD | NZ | Dual-pass mod-11 |
| Indian Aadhaar | IN | Verhoeff algorithm |
| Indian PAN | IN | Format validation |
| Japanese My Number | JP | Mod-11 checksum |
| Korean RRN | KR | Weighted checksum |
| South African ID | ZA | Luhn checksum |
| Turkish Kimlik | TR | Custom dual check |
| Israeli ID | IL | Luhn checksum |
| Brazilian CPF | BR | Check digit |
| Brazilian CNPJ | BR | Check digit |
| Argentine CUIT | AR | Mod-11 checksum |
| Chilean RUT | CL | Mod-11 with K |
| Colombian NIT | CO | Mod-11 prime weights |

> Add your [API key](#upgrade-to-blindfold-api-optional) to unlock names, addresses, organizations, and 60+ additional entity types with NLP-powered detection.

</details>
