# Changelog

All notable changes to the Blindfold SDKs will be documented in this file.

## [1.0.0] - 2026-03-01

First stable release of the Blindfold SDK suite across all platforms.

### Core PII Operations (all SDKs)
- **Tokenize** — Replace PII with reversible tokens (`<Person_1>`, `<Email Address_1>`, etc.)
- **Detokenize** — Restore original values from tokenized text (client-side, no API call)
- **Detect** — Identify PII entities with confidence scores without modifying text
- **Redact** — Permanently remove PII with configurable masking characters
- **Mask** — Partial masking with control over visible characters, direction, and mask character
- **Synthesize** — Replace PII with realistic synthetic data (18+ languages)
- **Hash** — Deterministic hashing with MD5, SHA-1, or SHA-256; configurable prefix and length
- **Encrypt** — AES encryption of detected PII with a user-provided key

### Batch Processing
- All 7 PII operations support batch mode via `texts` array (up to 100 items per request)

### Local Mode (Offline PII Detection)
- Built-in regex-based PII scanner — works without an API key
- 70+ entity detectors across US, EU, and UK locales
- Validators: Luhn (credit cards), IBAN mod-97, SSN format rules, NHS modulus-11
- Context-required patterns for low-specificity entities (CVV, ZIP, DOB)
- Configurable locales to control which country-specific patterns are active

### Multi-Region Support
- EU and US data residency with automatic endpoint routing
- Region-specific API URLs: `eu-api.blindfold.dev`, `us-api.blindfold.dev`

### Policies
- Built-in policies: `basic`, `strict`, `gdpr_eu`, `hipaa_us`, `pci_dss`
- Custom policy support via JSON files
- Entity type filtering and confidence score thresholds

### Python SDK (`blindfold-sdk`)
- Synchronous (`Blindfold`) and asynchronous (`AsyncBlindfold`) clients
- Pydantic response models with full type hints
- Retry logic with exponential backoff
- `pip install blindfold-sdk`

### JavaScript/TypeScript SDK (`@blindfold/sdk`)
- Full TypeScript support with type definitions
- CommonJS and ESM builds
- Subpath export `@blindfold/sdk/regex` for standalone local scanning
- `npm install @blindfold/sdk`

### CLI (`@blindfold/cli`)
- 10 commands: `detect`, `tokenize`, `detokenize`, `redact`, `mask`, `synthesize`, `hash`, `encrypt`, `discover`, `config`
- File and stdin input support
- `--local` flag for offline mode, `--region` for data residency
- `--json` and `--quiet` output modes
- `--batch` / `--file` for batch processing from files
- `npm install -g @blindfold/cli`

### MCP Server (`@blindfold/mcp-server`)
- 9 tools for Claude, Cursor, and other MCP-compatible AI assistants
- Batch support via `text` or `texts` parameter on all tools
- Policy, entity filtering, and language configuration per tool call
- `npm install -g @blindfold/mcp-server`

### Java SDK (`dev.blindfold:blindfold-sdk`)
- Synchronous (`Blindfold`) and asynchronous (`BlindfoldAsync`) clients
- `CompletableFuture`-based async API
- Local regex mode without API key
- Java 11+ compatible
