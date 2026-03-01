# Blindfold MCP Server

Detect, redact, tokenize, and mask PII directly from Claude, Cursor, or any MCP-compatible AI assistant. 80+ entity types, 30+ countries, works offline with zero dependencies.

[![npm version](https://img.shields.io/npm/v/@blindfold/mcp-server)](https://www.npmjs.com/package/@blindfold/mcp-server)
[![License](https://img.shields.io/npm/l/@blindfold/mcp-server)](https://github.com/blindfold-dev/blindfold/blob/main/LICENSE)

## Why Blindfold MCP?

- **Works offline, zero dependencies** — No API key needed. No network calls. No data leaves your machine.
- **80+ PII entity types** across 30+ countries with checksum validation (Luhn, IBAN mod-97, Verhoeff, etc.)
- **Run on your own infrastructure** — All processing happens locally. Nothing is sent externally unless you opt in with an API key.
- **9 tools**: detect, redact, tokenize, detokenize, mask, hash, encrypt, synthesize, discover
- **Compliance-ready** — Built-in GDPR, HIPAA, PCI-DSS policies
- **Optional NLP upgrade** — Add API key to detect names, addresses, organizations (60+ additional entities)
- **Batch support** — Process single text or arrays via `text`/`texts` parameters

## Setup (no API key needed)

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

That's it. No API key, no configuration. The server runs in **local mode** automatically — 80+ entity types detected offline using regex with checksum validation.

### Claude Code

Add to your project's `.mcp.json`:

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

### Cursor

Add via Settings > MCP Servers, or in `.cursor/mcp.json`:

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

## Upgrade to Blindfold API (optional)

For names, addresses, organizations, and 60+ entity types, add your API key:

1. Sign up at [blindfold.dev](https://www.blindfold.dev/)
2. Get your API key at [app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys)
3. Add it to your config:

```json
{
  "mcpServers": {
    "blindfold": {
      "command": "npx",
      "args": ["-y", "@blindfold/mcp-server"],
      "env": {
        "BLINDFOLD_API_KEY": "sk-..."
      }
    }
  }
}
```

### Force local mode (with API key)

If you have an API key but want to ensure no data leaves your machine:

```json
{
  "mcpServers": {
    "blindfold": {
      "command": "npx",
      "args": ["-y", "@blindfold/mcp-server"],
      "env": {
        "BLINDFOLD_API_KEY": "sk-...",
        "BLINDFOLD_MODE": "local"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `blindfold_detect` | Detect PII without modifying text |
| `blindfold_tokenize` | Replace PII with reversible tokens |
| `blindfold_detokenize` | Restore original values from tokens |
| `blindfold_mask` | Partially hide sensitive data |
| `blindfold_redact` | Permanently remove PII |
| `blindfold_synthesize` | Replace with realistic fake data |
| `blindfold_hash` | One-way hash PII |
| `blindfold_encrypt` | Encrypt PII with a password |
| `blindfold_discover` | Analyze samples for PII types (API mode only) |

All tools support batch processing via `text` (single) or `texts` (array) parameters.

## Usage Examples

Once configured, ask Claude to use Blindfold tools naturally:

**Tokenize before processing:**
> "Tokenize this patient record before summarizing: John Doe, SSN 123-45-6789, diagnosed with diabetes"

**Redact logs:**
> "Redact all PII from these server logs before analyzing them"

**Analyze data for PII:**
> "Discover what types of PII are in these customer feedback samples"

**Synthesize test data:**
> "Replace real customer data in this CSV with synthetic data"

### Recommended Instructions

For automatic PII protection, add to your project's `CLAUDE.md` or system prompt:

```
Always use blindfold_tokenize before processing any text that contains
personal information (names, emails, phone numbers, addresses, SSNs,
medical data). After generating a response, use blindfold_detokenize
to restore original values.
```

## Detection Policies

All tools accept an optional `policy` parameter:

| Policy | Use Case |
|--------|----------|
| `basic` | Common PII (names, emails, phones) |
| `strict` | Maximum detection, all entity types |
| `gdpr_eu` | EU GDPR-relevant entities |
| `hipaa_us` | US healthcare (PHI, SSN, insurance) |
| `pci_dss` | Payment card data (credit cards, IBANs) |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BLINDFOLD_API_KEY` | No | — | API key for NLP-powered detection. Omit for local mode. |
| `BLINDFOLD_MODE` | No | auto | Set to `local` to force offline mode |
| `BLINDFOLD_REGION` | No | — | Data residency: `eu` or `us` (API mode only) |
| `BLINDFOLD_BASE_URL` | No | `https://api.blindfold.dev` | Custom API endpoint |
| `BLINDFOLD_LOCALES` | No | `us` | Comma-separated locale codes (e.g., `us,eu,uk,de`) |

## Security

- **Local mode**: All processing happens on your machine. No data is sent anywhere.
- **API mode**: API key is stored locally in your config file and never sent to the AI model. All API calls use HTTPS.
- The AI model only sees tool names, parameters, and results.

## License

MIT
