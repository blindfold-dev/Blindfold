# What is Blindfold
Blindfold is an enterprise AI Gateway with automatic PII detection and anonymization

## How to use it

### 1. Intall SDK

Javascript/ Typescript

```bash
npm i @blindfold/sdk
```

Python SDK

```bash
pip install blindfold-sdk
```

### 2. Get Blindfold API key

1. Sign up to Blindfold here.
1. Sign up to Blindfold [here](https://www.blindfold.dev/).
3. Get your API key [here](https://app.blindfold.dev/api-keys).
3. Set environment variable with your API key
```
BLINDFOLD_API_KEY=sk-***
```     

### 3. Execute code and tokenize secret data

JavaScript / TypeScript
```typescript
import { Blindfold } from '@blindfold/sdk';

const client = new Blindfold({});

const response = await client.tokenize("Contact John Doe at john@example.com");

console.log(response.text); 
// "Contact <PERSON_1> at <EMAIL_ADDRESS_1>"

```

Python
```python
from blindfold import Blindfold

client = Blindfold()

response = client.tokenize(
    text="Contact John Doe at john@example.com",
    config={
        "entities": ["PERSON", "EMAIL_ADDRESS"],
        "score_threshold": 0.4
    }
)

print(response.text)
# "Contact <PERSON_1> at <EMAIL_ADDRESS_1>"

```