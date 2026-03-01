# Quick Start

Get up and running in under a minute. No API key needed — all packages work offline out of the box.

## Use a package

### JavaScript / TypeScript

```bash
npm install @blindfold/sdk
```

```typescript
import { Blindfold } from '@blindfold/sdk'

const client = new Blindfold()
const result = await client.detect("Email john@acme.com, SSN 123-45-6789")
console.log(result.detected_entities)
```

### Python

```bash
pip install blindfold-sdk
```

```python
from blindfold import Blindfold

client = Blindfold()
result = client.detect("Email john@acme.com, SSN 123-45-6789")
print(result.detected_entities)
```

### Java

```xml
<dependency>
    <groupId>dev.blindfold</groupId>
    <artifactId>blindfold-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

```java
Blindfold client = new Blindfold();
DetectResponse result = client.detect("Email john@acme.com, SSN 123-45-6789");
```

### CLI

```bash
npx -y @blindfold/cli detect "Email john@acme.com, SSN 123-45-6789"
```

### MCP Server (Claude, Cursor)

Add to your MCP config (no API key needed):

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

## Develop a package

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

## Run tests

```bash
# JavaScript SDK
cd packages/js-sdk && npm test

# CLI
cd packages/cli && npm test

# MCP Server
cd packages/mcp-server && npm test

# Python
cd packages/python-sdk && pytest

# Java
cd packages/java-sdk && mvn test
```

## What to read next

- Each package has a detailed README with all operations, options, and examples
- [docs.blindfold.dev](https://docs.blindfold.dev) — Full API reference
- Add an API key to unlock NLP-powered detection: [app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys)
