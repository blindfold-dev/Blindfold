# Blindfold CLI

Detect, redact, tokenize, and mask PII from the terminal. 80+ entity types, 30+ countries, works offline with zero dependencies.

[![npm version](https://img.shields.io/npm/v/@blindfold/cli)](https://www.npmjs.com/package/@blindfold/cli)
[![License](https://img.shields.io/npm/l/@blindfold/cli)](https://github.com/blindfold-dev/blindfold/blob/main/LICENSE)

## Why Blindfold CLI?

- **Works offline, zero dependencies** — No API key needed for local detection. No network calls. No data leaves your machine.
- **80+ PII entity types** across 30+ countries with checksum validation (Luhn, IBAN mod-97, Verhoeff, etc.)
- **Run on your own infrastructure** — Install locally, in CI/CD pipelines, or on air-gapped servers. Everything runs on your machine.
- **8 operations**: detect, redact, tokenize, detokenize, mask, hash, encrypt, synthesize
- **Compliance-ready** — Built-in GDPR, HIPAA, PCI-DSS policies
- **Optional NLP upgrade** — Add API key to detect names, addresses, organizations (60+ additional entities)
- **Pipe-friendly** — stdin, file input, JSON output, quiet mode for scripting

## Install

```bash
npm install -g @blindfold/cli
```

Or run directly with npx (no install):

```bash
npx -y @blindfold/cli detect "Contact John at john@example.com"
```

## Quick Start (no API key needed)

```bash
# Detect PII locally — no API key, no network call
blindfold detect "Email john@acme.com, SSN 123-45-6789"
# Email Address: john@acme.com (score: 0.95)
# Social Security Number: 123-45-6789 (score: 1.0)

# Redact PII locally
blindfold redact "Email john@acme.com, SSN 123-45-6789"
# "Email, SSN"

# Tokenize (reversible)
blindfold tokenize "Patient: Sarah Johnson, SSN: 123-45-6789"
# "Patient: <Person_1>, SSN: <Social Security Number_1>"

# Mask (partial)
blindfold mask "Card: 4532-1234-5678-9010"
# "Card: ***************9010"
```

Everything above runs **100% locally**. No API key. No network calls. No data leaves your machine.

## Use with `--local` flag

When you have an API key configured but want to force local-only processing:

```bash
# Force local mode — no data sent to any API
blindfold detect --local "SSN 123-45-6789"

# Useful for air-gapped environments or strict data residency
blindfold redact --local --file sensitive-data.txt
```

## Upgrade to Blindfold API (optional)

For names, addresses, organizations, and 60+ entity types, add your API key:

1. Sign up at [blindfold.dev](https://www.blindfold.dev/)
2. Get your API key at [app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys)
3. Save it:

```bash
blindfold config set-key your_api_key
# or set environment variable: BLINDFOLD_API_KEY=sk-***
```

```bash
# With API key — auto-switches to NLP-powered detection
blindfold detect "John Smith lives at 123 Oak Street"
```

## Commands

| Command | Description |
|---------|-------------|
| `detect` | Detect PII without modifying text |
| `tokenize` | Replace PII with reversible tokens |
| `detokenize` | Restore original values from tokens |
| `redact` | Permanently remove PII |
| `mask` | Partially hide PII |
| `synthesize` | Replace with realistic fake data |
| `hash` | One-way hash PII |
| `encrypt` | Encrypt PII with AES |
| `discover` | Analyze samples for PII types |
| `config` | Manage API key and settings |

## Input Methods

```bash
# Inline argument
blindfold detect "Contact John at john@example.com"

# Pipe from stdin
echo "Patient SSN: 123-45-6789" | blindfold redact

# Read from file
blindfold tokenize --file patient-notes.txt

# Batch processing from file (one text per line)
blindfold detect --batch --file records.txt
```

## Output Formats

```bash
# Human-readable (default)
blindfold detect "John Doe, john@example.com"

# JSON (for scripts)
blindfold detect --json "John Doe, john@example.com"

# Quiet (just the transformed text)
blindfold redact --quiet "Call John at 555-0123"
```

## Common Options

All PII commands accept:

```
-p, --policy <name>       Detection policy (basic, strict, gdpr_eu, hipaa_us, pci_dss)
-e, --entities <types>    Comma-separated entity types
-t, --threshold <n>       Minimum confidence score (0.0-1.0)
-f, --file <path>         Read input from file
    --batch               Process file line-by-line
    --local               Force local mode (no API calls)
    --locales <codes>     Locale codes (e.g., us,eu,uk,de)
```

Global options:

```
--api-key <key>           Override API key
--base-url <url>          Override API base URL
--region <region>         Data residency region (eu, us)
--json                    Output raw JSON
--quiet                   Output only transformed text
```

## Command-Specific Options

```bash
# Mask with custom settings
blindfold mask --masking-char "#" --chars-to-show 4 --from-end "Card: 4532-1234-5678-9010"

# Hash with specific algorithm
blindfold hash --hash-type sha256 --hash-length 12 "john@example.com"

# Encrypt with password
blindfold encrypt --encryption-key "my-secret" "Confidential data"

# Synthesize in German
blindfold synthesize --language de "Patient: Hans Mueller, Berlin"

# Detokenize with mapping
blindfold detokenize --mapping '{"<Person_1>":"John Doe"}' "Contact <Person_1>"
```

## Configuration

API key resolution order:

1. `--api-key` flag
2. `BLINDFOLD_API_KEY` environment variable
3. Saved config (`~/.config/blindfold/config.json`)

```bash
blindfold config set-key your_api_key    # Save API key
blindfold config show                    # Show current config
blindfold config clear                   # Remove saved config
blindfold config path                    # Print config file path
```

## Detection Policies

| Policy | Use Case |
|--------|----------|
| `basic` | Common PII (names, emails, phones) |
| `strict` | Maximum detection, all entity types |
| `gdpr_eu` | EU GDPR-relevant entities |
| `hipaa_us` | US healthcare (PHI, SSN, insurance) |
| `pci_dss` | Payment card data (credit cards, IBANs) |

## Examples

```bash
# CI/CD: redact logs before storage (local, no API key)
cat app.log | blindfold redact --quiet --policy strict > clean.log

# Script: get entities as JSON
entities=$(blindfold detect --json "John Doe, SSN 123-45-6789")

# HIPAA compliance check
blindfold detect --policy hipaa_us --file patient-records.txt

# Air-gapped server: force local mode
blindfold redact --local --file sensitive-export.csv --quiet > clean.csv

# Process EU data with EU-specific entities
blindfold detect --locales eu,de,fr --file eu-customer-data.txt
```

## License

MIT
