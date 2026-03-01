# Blindfold SDK Packages

This directory contains the official open-source SDKs for [Blindfold](https://blindfold.dev) — detect, redact, tokenize, and mask PII. All packages work offline with zero dependencies. No API key required.

## Available Packages

| Package | Directory | Registry | Install |
|---------|-----------|----------|---------|
| [Python SDK](./python-sdk) | `packages/python-sdk` | [PyPI](https://pypi.org/project/blindfold-sdk/) | `pip install blindfold-sdk` |
| [JS/TS SDK](./js-sdk) | `packages/js-sdk` | [npm](https://www.npmjs.com/package/@blindfold/sdk) | `npm install @blindfold/sdk` |
| [Java SDK](./java-sdk) | `packages/java-sdk` | Maven Central | `dev.blindfold:blindfold-sdk:1.0.0` |
| [CLI](./cli) | `packages/cli` | [npm](https://www.npmjs.com/package/@blindfold/cli) | `npm install -g @blindfold/cli` |
| [MCP Server](./mcp-server) | `packages/mcp-server` | [npm](https://www.npmjs.com/package/@blindfold/mcp-server) | `npx -y @blindfold/mcp-server` |

## Features (all packages)

- **8 operations**: detect, tokenize, detokenize, redact, mask, hash, encrypt, synthesize
- **80+ entity types** across 30+ countries with checksum validation
- **Offline / local mode** — regex-based detection, no API key, no network calls
- **Optional NLP upgrade** — add API key for names, addresses, organizations (60+ more entities)
- **Batch processing** — up to 100 texts per request
- **Built-in policies** — GDPR, HIPAA, PCI-DSS
- **Multi-region** — EU and US data residency

## Project Structure

```
packages/
├── python-sdk/          Python SDK (sync + async)
│   ├── src/blindfold/   Source code
│   └── tests/           Unit tests
├── js-sdk/              JavaScript/TypeScript SDK
│   ├── src/             Source code
│   └── tests/           Unit tests
├── java-sdk/            Java SDK (sync + async via CompletableFuture)
│   └── src/             Source code + tests
├── cli/                 Command-line interface
│   ├── src/             Source code
│   └── tests/           Unit tests
└── mcp-server/          MCP Server for AI assistants
    ├── src/             Source code
    └── tests/           Unit tests
```

## Development

### JS SDK / CLI / MCP Server

```bash
cd packages/js-sdk    # or cli, mcp-server
npm install
npm test
npm run build
```

### Python SDK

```bash
cd packages/python-sdk
pip install -e ".[dev]"
pytest
python -m build
```

### Java SDK

```bash
cd packages/java-sdk
mvn test
mvn clean package
```

## Code Quality

| Language | Linting | Formatting | Types | Testing |
|----------|---------|------------|-------|---------|
| TypeScript | ESLint | Prettier | TypeScript | Jest / Vitest |
| Python | Ruff | Black + isort | mypy | pytest |
| Java | — | — | javac | JUnit 5 |

## Documentation

- [docs.blindfold.dev](https://docs.blindfold.dev) — Full API reference
- Each package has its own detailed README with usage examples

## License

All packages are open source under the [MIT License](../LICENSE).
