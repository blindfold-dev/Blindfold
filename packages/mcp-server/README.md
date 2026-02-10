# @blindfold/mcp-server

MCP server for [Blindfold](https://blindfold.dev) — protect sensitive data in AI conversations. Detect, tokenize, mask, redact, hash, encrypt, or synthesize PII directly from Claude Desktop, Claude Code, Cursor, or any MCP-compatible client.

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "blindfold": {
      "command": "npx",
      "args": ["-y", "@blindfold/mcp-server"],
      "env": {
        "BLINDFOLD_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "blindfold": {
      "command": "npx",
      "args": ["-y", "@blindfold/mcp-server"],
      "env": {
        "BLINDFOLD_API_KEY": "your_api_key"
      }
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
      "args": ["-y", "@blindfold/mcp-server"],
      "env": {
        "BLINDFOLD_API_KEY": "your_api_key"
      }
    }
  }
}
```

## Get an API Key

1. Sign up at [app.blindfold.dev](https://app.blindfold.dev)
2. Go to **API Keys** and create a new key
3. Copy the key into your config

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
| `blindfold_discover` | Analyze samples for PII types |

## Usage Examples

Once configured, you can ask Claude to use Blindfold tools naturally:

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
| `BLINDFOLD_API_KEY` | Yes | — | Your Blindfold API key |
| `BLINDFOLD_BASE_URL` | No | `https://api.blindfold.dev` | API base URL |

## Security

- Your API key is stored locally in your config file and never sent to the AI model
- The MCP server runs as a local process on your machine
- All API calls use HTTPS
- The AI model only sees tool names, parameters, and results

## Development

```bash
npm install
npm run build
npm run dev   # watch mode
```

## License

MIT
