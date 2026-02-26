# What is Blindfold
Blindfold is an enterprise AI Gateway with automatic PII detection and anonymization. Available in **EU** and **US** regions for data residency compliance.

**Works offline with zero dependencies** - Detect and redact 40+ PII entity types locally. No API key required. Add your API key to unlock 60+ entity types with NLP-powered detection.

## How to use it

### 1. Install SDK

JavaScript / TypeScript
```bash
npm i @blindfold/sdk
```

Python
```bash
pip install blindfold-sdk
```

### 2. Detect PII instantly (no API key needed)

JavaScript / TypeScript
```typescript
import { Blindfold } from '@blindfold/sdk'

const client = new Blindfold()

const result = await client.detect("Email john@acme.com, SSN 123-45-6789")
console.log(result.detected_entities)
// [{ type: "Email Address", text: "john@acme.com", score: 0.95 }, ...]

const redacted = await client.redact("Email john@acme.com, SSN 123-45-6789")
console.log(redacted.text)
// "Email [EMAIL_ADDRESS], SSN [SOCIAL_SECURITY_NUMBER]"
```

Python
```python
from blindfold import Blindfold

client = Blindfold()

result = client.detect("Email john@acme.com, SSN 123-45-6789")
print(result.detected_entities)
# [DetectedEntity(type="Email Address", text="john@acme.com", score=0.95), ...]

result = client.redact("Email john@acme.com, SSN 123-45-6789")
print(result.text)
# "Email [EMAIL_ADDRESS], SSN [SOCIAL_SECURITY_NUMBER]"
```

### 3. Upgrade to Blindfold API (optional)

For names, addresses, organizations, and 60+ entity types, add your API key:

1. Sign up to Blindfold [here](https://www.blindfold.dev/).
2. Get your API key [here](https://app.blindfold.dev/api-keys).
3. Set environment variable with your API key
```
BLINDFOLD_API_KEY=sk-***
```

JavaScript / TypeScript
```typescript
const client = new Blindfold({
  apiKey: process.env.BLINDFOLD_API_KEY,
  region: 'eu'  // or 'us'
})

const response = await client.tokenize("Contact John Doe at john@example.com")
console.log(response.text)
// "Contact <Person_1> at <Email Address_1>"
```

Python
```python
client = Blindfold(
    api_key="your-api-key",
    region="eu"  # or "us"
)

response = client.tokenize(
    text="Contact John Doe at john@example.com",
    entities=["person", "email address"],
    score_threshold=0.4
)

print(response.text)
# "Contact <Person_1> at <Email Address_1>"
```

### Regional Endpoints

| Region | Endpoint |
|--------|----------|
| EU (default) | `https://eu-api.blindfold.dev` |
| US | `https://us-api.blindfold.dev` |

See [docs.blindfold.dev/essentials/regions](https://docs.blindfold.dev/essentials/regions) for details.