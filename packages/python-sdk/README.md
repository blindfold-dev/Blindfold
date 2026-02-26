# Blindfold Python SDK

The official Python SDK for Blindfold - The Privacy API for AI.

Securely tokenize, mask, redact, and encrypt sensitive data (PII) before sending it to LLMs or third-party services.

**Works offline with zero dependencies** - Detect, redact, synthesize, and more across 80+ PII entity types locally using the built-in regex scanner. No API key required. Add your API key to unlock 60+ entity types with NLP-powered detection.

## How to use it

### 1. Install SDK
```bash
pip install blindfold-sdk
```

### 2. Start detecting PII (no API key needed)

```python
from blindfold import Blindfold

client = Blindfold()

# Detect PII locally - no API key, no network call
result = client.detect("Email john@acme.com, SSN 123-45-6789")
for entity in result.detected_entities:
    print(f"{entity.type}: {entity.text} (score: {entity.score})")
# Email Address: john@acme.com (score: 0.95)
# Social Security Number: 123-45-6789 (score: 0.9)

# Redact PII locally
result = client.redact("Email john@acme.com, SSN 123-45-6789")
print(result.text)
# "Email, SSN"
```

### 3. Upgrade to Blindfold API (optional)

For names, addresses, organizations, and 60+ entity types, add your API key:

1. Sign up to Blindfold [here](https://www.blindfold.dev/).
2. Get your API key [here](https://app.blindfold.dev/api-keys).
3. Set environment variable with your API key
```
BLINDFOLD_API_KEY=sk-***
```

```python
# With API key - auto-switches to NLP-powered API
client = Blindfold(api_key="sk-...")

# Now detects names, addresses, organizations, and more
result = client.detect("John Smith lives at 123 Oak Street")
```

### Initialization

```python
from blindfold import Blindfold

# Local mode (no API key) - regex-based detection
client = Blindfold()

# API mode (with API key) - NLP-powered detection
client = Blindfold(api_key="sk-...")

# Force local mode even with an API key (useful for latency-critical paths)
client = Blindfold(api_key="sk-...", mode="local")
```

### Tokenize (Reversible)

Replace sensitive data with reversible tokens (e.g., `<Person_1>`).

```python
response = client.tokenize(
    text="Contact John Doe at john@example.com",
    policy="gdpr_eu",  # Optional: Use a pre-configured policy (e.g., 'hipaa_us', 'basic')
    entities=["person", "email address"],  # Optional: Filter specific entities
    score_threshold=0.4  # Optional: Set confidence threshold
)

print(response.text)
# "Contact <Person_1> at <Email Address_1>"

print(response.mapping)
# { "<Person_1>": "John Doe", "<Email Address_1>": "john@example.com" }
```

### Detokenize

Restore original values from tokens.

**⚡ Note:** Detokenization is performed **client-side** for better performance, security, and offline support. No API call is made.

```python
# Runs locally - no API call!
original = client.detokenize(
    text="AI response for <Person_1>",
    mapping=response.mapping
)

print(original.text)
# "AI response for John Doe"

print(original.replacements_made)
# 1
```

### Mask

Partially hide sensitive data (e.g., `****-****-****-1234`).

```python
response = client.mask(
    text="Credit card: 4532-7562-9102-3456",
    masking_char="*",
    chars_to_show=4,
    from_end=True
)

print(response.text)
# "Credit card: ***************3456"
```

### Redact

Permanently remove sensitive data.

```python
response = client.redact(
    text="My password is secret123"
)
```

### Hash

Replace data with deterministic hashes (useful for analytics/matching).

```python
response = client.hash(
    text="User ID: 12345",
    hash_type="sha256",
    hash_prefix="ID_"
)
```

### Synthesize

Replace real data with realistic fake data. Works locally with format-preserving generation (no API key needed), or with NLP-powered synthesis via the API.

```python
# Works offline - no API key required
client = Blindfold()
response = client.synthesize("Email john@acme.com, SSN 123-45-6789")
print(response.text)
# "Email user3a9f1b2c@example.com, SSN 847-29-3156" (format-preserving)

# With API key - NLP-powered synthesis (names, addresses, etc.)
response = client.synthesize(
    text="John lives in New York",
    language="en"
)
print(response.text)
# "Michael lives in Boston" (example)
```

### Encrypt

Encrypt sensitive data using AES (reversible with key).

```python
response = client.encrypt(
    text="Secret message",
    encryption_key="your-secure-key-min-16-chars"
)
```

## Batch Processing

Process multiple texts in a single request (max 100 texts):

```python
result = client.tokenize_batch(
    ["Contact John Doe", "jane@example.com", "No PII here"],
    policy="gdpr_eu"
)

print(result.total)       # 3
print(result.succeeded)   # 3
print(result.failed)      # 0

for item in result.results:
    print(item["text"])
```

All methods have batch variants: `tokenize_batch`, `detect_batch`, `redact_batch`, `mask_batch`, `synthesize_batch`, `hash_batch`, `encrypt_batch`.

## Async Usage

The SDK also supports asyncio:

```python
import asyncio
from blindfold import AsyncBlindfold

async def main():
    async with AsyncBlindfold(api_key="...") as client:
        response = await client.tokenize("Hello John")
        print(response.text)

        # Note: detokenize is also synchronous in async client (no await)
        original = client.detokenize(response.text, response.mapping)
        print(original.text)

asyncio.run(main())
```

## Local PII Scanner

The built-in regex scanner works offline with zero dependencies. Use it directly for fine-grained control:

```python
from blindfold.regex import PIIScanner, EntityType

# Default: US locale
scanner = PIIScanner()
matches = scanner.detect("Call me at john@acme.com or 555-867-5309")

for match in matches:
    print(f"{match.entity_type}: {match.text} (score: {match.score})")

# Redact PII
redacted_text, matches = scanner.redact("SSN 123-45-6789, CC 4532015112830366")
print(redacted_text)
# "SSN, CC"
```

### Multi-locale support

Enable detection for different regions:

```python
# US + EU entities
scanner = PIIScanner(locales=["us", "eu"])
matches = scanner.detect("SSN 123-45-6789, IBAN DE89370400440532013000")

# UK entities
scanner = PIIScanner(locales=["uk"])
matches = scanner.detect("NI number: AB 12 34 56 A")

# All locales
scanner = PIIScanner(locales=["us", "eu", "uk"])
```

### Filter by entity type

```python
# Only detect emails and credit cards
scanner = PIIScanner(entities=[EntityType.EMAIL, EntityType.CREDIT_CARD])
```

### Supported local entity types

| Entity Type | Locale | Validation |
|---|---|---|
| Email Address | Universal | RFC 5322 pattern |
| Credit Card Number | Universal | Luhn checksum |
| Phone Number | Universal | Format + digit count |
| IP Address (v4/v6) | Universal | Octet range |
| URL | Universal | Pattern |
| MAC Address | Universal | Pattern |
| Date of Birth | Universal | Context-required |
| CVV/CVC | Universal | Context-required |
| Social Security Number | US | Format rules + context |
| Driver's License | US | Context-required |
| US Passport | US | Context-required |
| Tax ID / EIN | US | Prefix validation + context |
| ZIP Code | US | Context-required |
| IBAN | EU | ISO 7064 mod-97 checksum |
| Postal Code | EU | DE/FR/NL patterns |
| VAT ID | EU | Country prefix + format |
| UK NI Number | UK | Format validation |
| UK NHS Number | UK | Modulus-11 checksum |
| UK Postcode | UK | Pattern |
| UK Passport | UK | Context-required |
| German Personal ID | DE | Context-required |
| German Tax ID | DE | Check digit |
| French National ID (NIR) | FR | Check digit |
| Spanish DNI | ES | Letter validation |
| Spanish NIE | ES | Letter validation |
| Italian Codice Fiscale | IT | Check digit |
| Portuguese NIF | PT | Check digit |
| Polish PESEL | PL | Check digit |
| Polish NIP | PL | Check digit |
| Czech Birth Number | CZ | Modulus validation |
| Czech ICO (Company ID) | CZ | Mod-11 weighted checksum |
| Czech DIC (Tax/VAT ID) | CZ | ICO checksum / mod-11 |
| Czech Bank Account | CZ | Mod-11 weighted checksum |
| Slovak Birth Number | SK | Modulus validation |
| Dutch BSN | NL | Modulus-11 check |
| Romanian CNP | RO | Check digit |
| Danish CPR | DK | Date validation |
| Swedish Personnummer | SE | Luhn algorithm |
| Norwegian Birth Number | NO | Check digit |
| Russian INN | RU | Check digit |
| Russian SNILS | RU | Check digit |
| Brazilian CPF | BR | Check digit |
| Brazilian CNPJ | BR | Check digit |
| US ITIN | US | Format validation |
| UK UTR | UK | Mod-11 checksum |
| French SIREN | FR | Luhn checksum |
| Spanish NSS | ES | Mod-97 checksum |
| Spanish CIF | ES | Custom checksum |
| Italian Partita IVA | IT | Luhn-like checksum |
| Polish REGON | PL | Mod-11 checksum |
| Slovak ICO | SK | Mod-11 weighted checksum |
| Slovak DIC | SK | Mod-11 divisibility |
| Romanian CUI | RO | Mod-11 checksum |
| Danish CVR | DK | Mod-11 checksum |
| Swedish Organisationsnummer | SE | Luhn algorithm |
| Norwegian Organisasjonsnummer | NO | Mod-11 checksum |
| Belgian National Number | BE | Mod-97 checksum |
| Belgian Enterprise Number | BE | Mod-97 checksum |
| Austrian SVNR | AT | Mod-11 checksum |
| Irish PPS Number | IE | Mod-23 checksum |
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
| Canadian SIN | CA | Luhn checksum |
| Swiss AHV | CH | EAN-13 checksum |
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
| Argentine CUIT | AR | Mod-11 checksum |
| Chilean RUT | CL | Mod-11 with K |
| Colombian NIT | CO | Mod-11 prime weights |

> Need names, addresses, organizations, and 60+ entity types? [Add your API key](#3-upgrade-to-blindfold-api-optional) to unlock NLP-powered detection.

## Configuration

### Entity Types (API mode)

With an API key, all local entity types are available plus:
- `person`
- `address`
- `organization`
- `medical condition`
- And 50+ more entity types

### Error Handling

The SDK raises specific exceptions:

```python
from blindfold.errors import AuthenticationError, APIError, NetworkError

try:
    client.tokenize("...")
except AuthenticationError:
    # Handle invalid API key
    pass
except APIError as e:
    # Handle API error (e.g. validation)
    print(e)
except NetworkError:
    # Handle network issues
    pass
```
