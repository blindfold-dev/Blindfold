# Blindfold

Detect, redact, tokenize, and mask PII across Python, JavaScript, Go, Java, .NET, CLI, and MCP. 80+ entity types, 30+ countries, works offline with zero dependencies.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@blindfold/sdk)](https://www.npmjs.com/package/@blindfold/sdk)
[![PyPI version](https://img.shields.io/pypi/v/blindfold-sdk)](https://pypi.org/project/blindfold-sdk/)
[![Go Reference](https://pkg.go.dev/badge/github.com/blindfold-dev/Blindfold/packages/go-sdk.svg)](https://pkg.go.dev/github.com/blindfold-dev/Blindfold/packages/go-sdk)
[![NuGet version](https://img.shields.io/nuget/v/Blindfold.Sdk)](https://www.nuget.org/packages/Blindfold.Sdk)

## Why Blindfold?

- **Works offline, zero dependencies** — No API key needed for local detection. No network calls. No external packages.
- **80+ PII entity types** across 30+ countries with checksum validation (Luhn, IBAN mod-97, Verhoeff, etc.)
- **85x faster than Presidio** — 0.4s vs 34s on 3,000 samples ([benchmark](https://blindfold.dev/blog/pii-detection-benchmark))
- **Higher accuracy** — F1 58.6% vs Presidio 38.8% on AI4Privacy multilingual benchmark
- **8 operations**: detect, redact, tokenize, detokenize, mask, hash, encrypt, synthesize
- **Compliance-ready** — Built-in GDPR, HIPAA, PCI-DSS policies
- **Optional NLP upgrade** — Add API key to detect names, addresses, organizations (60+ additional entities)
- **7 packages**: Python SDK, JS/TS SDK, Go SDK, Java SDK, .NET SDK, CLI, MCP Server

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

## Packages

| Package | Install | Docs |
|---------|---------|------|
| [Python SDK](packages/python-sdk) | `pip install blindfold-sdk` | [README](packages/python-sdk/README.md) |
| [JS/TS SDK](packages/js-sdk) | `npm install @blindfold/sdk` | [README](packages/js-sdk/README.md) |
| [Go SDK](packages/go-sdk) | `go get github.com/blindfold-dev/Blindfold/packages/go-sdk` | [README](packages/go-sdk/README.md) |
| [Java SDK](packages/java-sdk) | `dev.blindfold:blindfold-sdk:1.0.0` | [README](packages/java-sdk/README.md) |
| [.NET SDK](packages/dotnet-sdk) | `dotnet add package Blindfold.Sdk` | [README](packages/dotnet-sdk/README.md) |
| [CLI](packages/cli) | `npm install -g @blindfold/cli` | [README](packages/cli/README.md) |
| [MCP Server](packages/mcp-server) | `npx -y @blindfold/mcp-server` | [README](packages/mcp-server/README.md) |

## Quick Start (no API key needed)

### JavaScript / TypeScript

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

### Python

```python
from blindfold import Blindfold

client = Blindfold()

# Detect PII locally — no API key, no network call
result = client.detect("Email john@acme.com, SSN 123-45-6789")
for entity in result.detected_entities:
    print(f"{entity.type}: {entity.text} (score: {entity.score})")
# Email Address: john@acme.com (score: 0.95)
# Social Security Number: 123-45-6789 (score: 1.0)

# Redact PII locally
result = client.redact("Email john@acme.com, SSN 123-45-6789")
print(result.text)
# "Email, SSN"
```

### Java

```java
import dev.blindfold.sdk.Blindfold;
import dev.blindfold.sdk.models.*;

Blindfold client = new Blindfold();

// Detect PII locally — no API key, no network call
DetectResponse result = client.detect("Email john@acme.com, SSN 123-45-6789");
for (DetectedEntity entity : result.getDetectedEntities()) {
    System.out.println(entity.getType() + ": " + entity.getText()
        + " (score: " + entity.getScore() + ")");
}

// Redact PII locally
RedactResponse redacted = client.redact("Email john@acme.com, SSN 123-45-6789");
System.out.println(redacted.getText());
```

### Go

```go
package main

import (
    "context"
    "fmt"

    blindfold "github.com/blindfold-dev/Blindfold/packages/go-sdk"
)

func main() {
    client := blindfold.New()
    ctx := context.Background()

    // Detect PII locally — no API key, no network call
    result, _ := client.Detect(ctx, "Email john@acme.com, SSN 123-45-6789")
    for _, entity := range result.DetectedEntities {
        fmt.Printf("%s: %s (score: %.2f)\n", entity.Type, entity.Text, entity.Score)
    }
    // Email Address: john@acme.com (score: 0.95)
    // Social Security Number: 123-45-6789 (score: 1.00)

    // Redact PII locally
    redacted, _ := client.Redact(ctx, "Email john@acme.com, SSN 123-45-6789")
    fmt.Println(redacted.Text)
    // "Email, SSN"
}
```

### C# / .NET

```csharp
using Blindfold.Sdk;

using var client = new BlindfoldClient();

// Detect PII locally — no API key, no network call
var result = await client.DetectAsync("Email john@acme.com, SSN 123-45-6789");
foreach (var entity in result.DetectedEntities)
{
    Console.WriteLine($"{entity.Type}: {entity.Text} (score: {entity.Score:F2})");
}
// Email Address: john@acme.com (score: 0.95)
// Social Security Number: 123-45-6789 (score: 1.00)

// Redact PII locally
var redacted = await client.RedactAsync("Email john@acme.com, SSN 123-45-6789");
Console.WriteLine(redacted.Text);
// "Email, SSN"
```

### CLI

```bash
# No install needed
npx -y @blindfold/cli detect "Email john@acme.com, SSN 123-45-6789"

# Or install globally
npm install -g @blindfold/cli
blindfold redact "Email john@acme.com, SSN 123-45-6789"
blindfold redact --file sensitive-data.txt --quiet > clean.txt
```

### MCP Server (Claude, Cursor, etc.)

Add to your `claude_desktop_config.json`, `.mcp.json`, or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "blindfold": {
      "command": "npx",
      "args": ["-y", "@blindfold/mcp-server"]
    }
  }
}
```

Then ask Claude: *"Tokenize this patient record before summarizing: John Doe, SSN 123-45-6789"*

## Upgrade to Blindfold API (optional)

For names, addresses, organizations, and 60+ entity types, add your API key:

1. Sign up at [blindfold.dev](https://www.blindfold.dev/)
2. Get your API key at [app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys)
3. Set environment variable: `BLINDFOLD_API_KEY=sk-***`

```typescript
// JS — auto-switches to NLP-powered API
const client = new Blindfold({ apiKey: 'sk-...', region: 'eu' })
const response = await client.tokenize("Contact John Doe at john@example.com")
// "Contact <Person_1> at <Email Address_1>"
```

```python
# Python — auto-switches to NLP-powered API
client = Blindfold(api_key="sk-...", region="eu")
response = client.tokenize("Contact John Doe at john@example.com")
# "Contact <Person_1> at <Email Address_1>"
```

## Operations

All operations work offline in local mode. All support batch processing (up to 100 texts per request).

| Operation | Description |
|-----------|-------------|
| **Detect** | Identify PII entities with confidence scores |
| **Tokenize** | Replace PII with reversible tokens (`<Person_1>`, `<Email Address_1>`) |
| **Detokenize** | Restore original values from tokens (client-side, no API call) |
| **Redact** | Permanently remove PII |
| **Mask** | Partially hide PII (`***-**-6789`) |
| **Synthesize** | Replace with realistic fake data |
| **Hash** | Deterministic hashing (MD5, SHA-1, SHA-256) |
| **Encrypt** | AES encryption with user-provided key |

## Detection Policies

| Policy | Use Case |
|--------|----------|
| `basic` | Common PII (names, emails, phones) |
| `strict` | Maximum detection, all entity types |
| `gdpr_eu` | EU GDPR-relevant entities |
| `hipaa_us` | US healthcare (PHI, SSN, insurance) |
| `pci_dss` | Payment card data (credit cards, IBANs) |

## Regional Endpoints

| Region | Endpoint |
|--------|----------|
| EU (default) | `https://eu-api.blindfold.dev` |
| US | `https://us-api.blindfold.dev` |

See [docs.blindfold.dev/essentials/regions](https://docs.blindfold.dev/essentials/regions) for details.

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

## Documentation

- [docs.blindfold.dev](https://docs.blindfold.dev) — Full API reference and guides
- [blindfold.dev](https://blindfold.dev) — Product website
- [status.blindfold.dev](https://status.blindfold.dev) — Service status

## License

[MIT](LICENSE)
