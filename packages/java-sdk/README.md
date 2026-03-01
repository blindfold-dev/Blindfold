# Blindfold Java SDK

Detect, redact, tokenize, and mask PII in Java. 80+ entity types, 30+ countries, works offline with zero external dependencies.

[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/blindfold-dev/blindfold/blob/main/LICENSE)

## Why Blindfold?

- **Works offline, zero external dependencies** — No API key needed for local detection. No network calls. Only Gson for JSON.
- **80+ PII entity types** across 30+ countries with checksum validation (Luhn, IBAN mod-97, Verhoeff, etc.)
- **8 operations**: detect, redact, tokenize, detokenize, mask, hash, encrypt, synthesize
- **Compliance-ready** — Target GDPR, HIPAA, PCI-DSS entities with built-in filters
- **Optional NLP upgrade** — Add API key to detect names, addresses, organizations (60+ additional entities)
- **Batch processing**, async support via `CompletableFuture`, typed exceptions

## Quick Comparison

| Feature | Blindfold | Presidio | regex-only |
|---|---|---|---|
| Entity types (local) | 80+ | ~20 | Custom |
| Countries | 30+ | ~5 | Custom |
| Checksum validation | Luhn, mod-97, Verhoeff, ... | Partial | No |
| Zero external deps | Yes (only Gson) | No (spaCy) | Yes |
| NLP upgrade path | Yes (API) | Yes (built-in) | No |
| Tokenize/detokenize | Yes | No | No |

## Common Use Cases

- **Sanitize LLM prompts** — Strip PII before sending to OpenAI, Anthropic, etc.
- **PII-safe RAG pipelines** — Redact before embedding, restore after retrieval
- **Log scrubbing** — Anonymize data in logs and data pipelines
- **GDPR/HIPAA compliance** — Filter entities relevant to your compliance scope
- **Synthetic test data** — Format-preserving fake data generation

## Requirements

- Java 11+
- Gson (included as dependency)

## Install

### Maven

```xml
<dependency>
    <groupId>dev.blindfold</groupId>
    <artifactId>blindfold-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'dev.blindfold:blindfold-sdk:1.0.0'
```

## Quick Start (no API key needed)

```java
import dev.blindfold.sdk.Blindfold;
import dev.blindfold.sdk.models.*;

// No API key = automatic local mode
Blindfold client = new Blindfold();

// Detect PII locally — no API key, no network call
DetectResponse result = client.detect("Email john@acme.com, SSN 123-45-6789");
for (DetectedEntity entity : result.getDetectedEntities()) {
    System.out.println(entity.getType() + ": " + entity.getText()
        + " (score: " + entity.getScore() + ")");
}
// Email Address: john@acme.com (score: 0.95)
// Social Security Number: 123-45-6789 (score: 1.0)

// Redact PII locally
RedactResponse redacted = client.redact("Email john@acme.com, SSN 123-45-6789");
System.out.println(redacted.getText());
// "Email, SSN"
```

## Upgrade to Blindfold API (optional)

For names, addresses, organizations, and 60+ entity types, add your API key:

1. Sign up at [blindfold.dev](https://www.blindfold.dev/)
2. Get your API key at [app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys)
3. Set environment variable: `BLINDFOLD_API_KEY=sk-***`

```java
// With API key — auto-switches to NLP-powered API
Blindfold client = new Blindfold("sk-...");
DetectResponse result = client.detect("John Smith lives at 123 Oak Street");
```

## Initialization

```java
import dev.blindfold.sdk.Blindfold;
import dev.blindfold.sdk.BlindfoldOptions;

// Local mode (no API key) — regex-based detection
Blindfold client = new Blindfold();

// API mode (with API key) — NLP-powered detection
Blindfold client = new Blindfold("sk-...");

// Full configuration
Blindfold client = new Blindfold(BlindfoldOptions.builder()
    .apiKey("sk-...")
    .region("eu")           // "eu" or "us"
    .maxRetries(3)
    .retryDelay(500)        // milliseconds
    .timeout(30000)         // milliseconds
    .userId("user-123")
    .build());

// Force local mode even with an API key (useful for latency-critical paths)
Blindfold client = new Blindfold(BlindfoldOptions.builder()
    .apiKey("sk-...")
    .mode("local")
    .build());
```

## Operations

### Tokenize (Reversible)

Replace sensitive data with reversible tokens (e.g., `<Person_1>`).

```java
TokenizeResponse response = client.tokenize("Contact John Doe at john@example.com");

System.out.println(response.getText());
// "Contact <Person_1> at <Email Address_1>"

System.out.println(response.getMapping());
// {"<Person_1>": "John Doe", "<Email Address_1>": "john@example.com"}

// Filter by entity types
TokenizeResponse filtered = client.tokenize(
    "Email john@acme.com and jane@acme.com",
    List.of("email address")
);
```

### Detokenize

Restore original values from tokens. Runs **client-side** — no API call.

```java
DetokenizeResponse original = client.detokenize(
    "AI response for <Person_1>",
    response.getMapping()
);
System.out.println(original.getText());
// "AI response for John Doe"
```

### Detect

Find PII entities in text.

```java
DetectResponse response = client.detect("Call (555) 123-4567");

// Filter by entity types
DetectResponse filtered = client.detect(
    "Email john@acme.com, SSN 123-45-6789",
    List.of("email address")
);
```

### Redact

Permanently remove sensitive data.

```java
RedactResponse response = client.redact("SSN: 123-45-6789");
System.out.println(response.getText());
// "SSN:"

// Filter by entity types
RedactResponse filtered = client.redact("SSN: 123-45-6789", List.of("social security number"));
```

### Mask

Partially hide sensitive data (e.g., `****-****-****-1234`).

```java
MaskResponse response = client.mask(
    "Card: 4111-1111-1111-1111",
    4,        // chars to show
    true,     // from end
    "*",      // masking character
    null      // entities filter (null = all)
);
System.out.println(response.getText());
// "Card: ***************1111"
```

### Hash

Replace data with deterministic hashes (useful for analytics/matching).

```java
HashResponse response = client.hash(
    "Email john@acme.com",
    "sha256",     // hash type: "md5", "sha1", "sha256"
    "HASH_",      // prefix
    16,           // hash length
    null          // entities filter
);
```

### Encrypt

Encrypt sensitive data using AES (reversible with key).

```java
EncryptResponse response = client.encrypt(
    "Email john@acme.com",
    "my-secret-key-16chars"
);
```

### Synthesize

Replace real data with realistic fake data. Works offline with format-preserving generation.

```java
// Works offline — no API key required
Blindfold client = new Blindfold();
SynthesizeResponse response = client.synthesize("Email john@acme.com, SSN 123-45-6789");
System.out.println(response.getText());
// "Email user3f8a2b1c@example.com, SSN 847-29-3156"

// With API key — NLP-powered synthesis (names, addresses, etc.)
SynthesizeResponse response = client.synthesize("John lives in New York", "en", null);
System.out.println(response.getText());
// "Michael lives in Boston"
```

## Batch Processing

Process multiple texts in a single request (max 100 texts):

```java
BatchResponse<DetectResponse> result = client.detectBatch(
    List.of("Contact John Doe", "jane@example.com", "No PII here")
);

System.out.println(result.getTotal());      // 3
System.out.println(result.getSucceeded());  // 3
System.out.println(result.getFailed());     // 0

for (DetectResponse item : result.getResults()) {
    System.out.println(item.getDetectedEntities());
}

// With entity filter
BatchResponse<TokenizeResponse> filtered = client.tokenizeBatch(
    List.of("john@acme.com", "SSN 123-45-6789"),
    List.of("email address")
);
```

Batch methods available: `detectBatch`, `tokenizeBatch`.

## Async Usage

```java
import dev.blindfold.sdk.BlindfoldAsync;

BlindfoldAsync asyncClient = new BlindfoldAsync(
    BlindfoldOptions.builder().build()
);

CompletableFuture<DetectResponse> future = asyncClient.detectAsync("Email john@acme.com");
DetectResponse response = future.get();

// All operations have async variants:
// detectAsync, tokenizeAsync, detokenizeAsync, redactAsync,
// maskAsync, hashAsync, encryptAsync, synthesizeAsync
```

## Local PII Scanner

The built-in regex scanner works offline with no external dependencies. Use it directly for fine-grained control:

```java
import dev.blindfold.sdk.regex.PIIScanner;
import dev.blindfold.sdk.regex.PIIMatch;

// Default: US locale
PIIScanner scanner = new PIIScanner(List.of("us", "eu"));
List<PIIMatch> matches = scanner.detect("IBAN: DE89 3704 0044 0532 0130 00");

for (PIIMatch match : matches) {
    System.out.printf("%s: %s (%.2f) [%d:%d]%n",
        match.getEntityType(), match.getText(), match.getScore(),
        match.getStart(), match.getEnd());
}
```

### Multi-locale support

```java
// US + EU entities
PIIScanner scanner = new PIIScanner(List.of("us", "eu"));

// UK entities
PIIScanner scanner = new PIIScanner(List.of("uk"));

// All locales
Blindfold client = new Blindfold(BlindfoldOptions.builder()
    .locales(List.of("us", "eu", "uk", "de", "fr", "es", "it"))
    .build());
```

Available locales: `us`, `uk`, `eu`, `de`, `fr`, `es`, `it`, `pt`, `pl`, `cz`, `sk`, `ru`, `nl`, `ro`, `dk`, `se`, `no`, `be`, `at`, `ie`, `fi`, `hu`, `bg`, `hr`, `si`, `lt`, `lv`, `ee`, `ca`, `ch`, `au`, `nz`, `in`, `jp`, `kr`, `za`, `tr`, `il`, `ar`, `cl`, `co`, `br`

## Error Handling

```java
import dev.blindfold.sdk.errors.AuthenticationException;
import dev.blindfold.sdk.errors.ApiException;
import dev.blindfold.sdk.errors.NetworkException;

try {
    client.tokenize("...");
} catch (AuthenticationException e) {
    // Handle invalid API key (401)
} catch (ApiException e) {
    // Handle API error (e.g. validation, rate limit)
    System.out.println(e.getStatusCode());
} catch (NetworkException e) {
    // Handle network issues
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

## License

MIT
