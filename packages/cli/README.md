# @blindfold/cli

CLI for [Blindfold](https://blindfold.dev) — detect and protect PII from the terminal.

## Install

```bash
npm install -g @blindfold/cli
```

Or run directly with npx:

```bash
npx -y @blindfold/cli detect "Contact John at john@example.com"
```

## Quick Start

```bash
# Save your API key
blindfold config set-key your_api_key

# Detect PII
blindfold detect "Contact John at john@example.com"

# Tokenize (reversible)
blindfold tokenize "Patient: Sarah Johnson, SSN: 123-45-6789"

# Redact (permanent)
blindfold redact "Call me at 555-0123"

# Mask (partial)
blindfold mask "Card: 4532-1234-5678-9010"
```

## Get an API Key

1. Sign up at [app.blindfold.dev](https://app.blindfold.dev)
2. Go to **API Keys** and create a new key
3. Run `blindfold config set-key your_api_key`

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
```

Global options:

```
--api-key <key>           Override API key
--base-url <url>          Override API base URL
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
# CI/CD: redact logs before storage
cat app.log | blindfold redact --quiet --policy strict > clean.log

# Script: get entities as JSON
entities=$(blindfold detect --json "John Doe, SSN 123-45-6789")

# HIPAA compliance check
blindfold detect --policy hipaa_us --file patient-records.txt
```

## License

MIT
