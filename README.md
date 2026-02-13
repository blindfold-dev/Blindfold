# What is Blindfold
Blindfold is an enterprise AI Gateway with automatic PII detection and anonymization. Available in **EU** and **US** regions for data residency compliance.

## How to use it

### 1. Install SDK

Javascript/ Typescript

```bash
npm i @blindfold/sdk
```

Python SDK

```bash
pip install blindfold-sdk
```

### 2. Get Blindfold API key

1. Sign up to Blindfold [here](https://www.blindfold.dev/).
2. Get your API key [here](https://app.blindfold.dev/api-keys).
3. Set environment variable with your API key
```
BLINDFOLD_API_KEY=sk-***
```

### 3. Execute code and tokenize secret data

JavaScript / TypeScript
```typescript
import { Blindfold } from '@blindfold/sdk';

const client = new Blindfold({
  apiKey: process.env.BLINDFOLD_API_KEY,
  region: 'eu'  // or 'us'
});

const response = await client.tokenize("Contact John Doe at john@example.com");

console.log(response.text);
// "Contact <Person_1> at <Email Address_1>"

```

Python
```python
from blindfold import Blindfold

client = Blindfold(
    api_key="your-api-key",
    region="eu"  # or "us"
)

response = client.tokenize(
    text="Contact John Doe at john@example.com",
    config={
        "entities": ["person", "email address"],
        "score_threshold": 0.4
    }
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