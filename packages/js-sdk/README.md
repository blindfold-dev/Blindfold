# Blindfold JS SDK

The official JavaScript/TypeScript SDK for Blindfold - The Privacy API for AI.

Securely tokenize, mask, redact, and encrypt sensitive data (PII) before sending it to LLMs or third-party services.

## How to use it

### 1. Install SDK

Javascript/ Typescript

```bash
npm install @blindfold/sdk
# or
yarn add @blindfold/sdk
# or
pnpm add @blindfold/sdk
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

### Initialization

```typescript
import { Blindfold } from '@blindfold/sdk';

const client = new Blindfold({
  apiKey: 'your-api-key-here',
  // Optional: Track specific end-user for audit logs
  userId: 'user_123' 
});
```

### Tokenize (Reversible)

Replace sensitive data with reversible tokens (e.g., `<Person_1>`).

```typescript
const response = await client.tokenize(
  "Contact John Doe at john@example.com",
  {
    // Optional: Use a pre-configured policy
    policy: 'gdpr_eu',  // or 'hipaa_us', 'basic'
    // Optional: Filter specific entities
    entities: ['person', 'email address'],
    // Optional: Set confidence threshold
    score_threshold: 0.4
  }
);

console.log(response.text);
// "Contact <Person_1> at <Email Address_1>"

console.log(response.mapping);
// { "<Person_1>": "John Doe", "<Email Address_1>": "john@example.com" }
```

### Detokenize

Restore original values from tokens.

**⚡ Note:** Detokenization is performed **client-side** for better performance, security, and offline support. No API call is made.

```typescript
// No await needed - runs locally!
const original = client.detokenize(
  "AI response for <Person_1>",
  response.mapping
);

console.log(original.text);
// "AI response for John Doe"

console.log(original.replacements_made);
// 1
```

### Mask

Partially hide sensitive data (e.g., `****-****-****-1234`).

```typescript
const response = await client.mask(
  "Credit card: 4532-7562-9102-3456",
  {
    masking_char: '*',
    chars_to_show: 4,
    from_end: true
  }
);

console.log(response.text);
// "Credit card: ***************3456"
```

### Redact

Permanently remove sensitive data.

```typescript
const response = await client.redact(
  "My password is secret123",
  {
    entities: ['person', 'email address']
  }
);
```

### Hash

Replace data with deterministic hashes (useful for analytics/matching).

```typescript
const response = await client.hash(
  "User ID: 12345",
  {
    hash_type: 'sha256',
    hash_prefix: 'ID_'
  }
);
```

### Synthesize

Replace real data with realistic fake data.

```typescript
const response = await client.synthesize(
  "John lives in New York",
  {
    language: 'en'
  }
);

console.log(response.text);
// "Michael lives in Boston" (example)
```

### Encrypt

Encrypt sensitive data using AES (reversible with key).

```typescript
const response = await client.encrypt(
  "Secret message",
  {
    encryption_key: 'your-secure-key-min-16-chars'
  }
);
```

## Configuration

### Entity Types

Common supported entities:
- `person`
- `email address`
- `phone number`
- `credit card number`
- `ip address`
- `address`
- `date of birth`
- `organization`
- `iban`
- `social security number`
- `medical condition`
- `passport number`
- `driver's license number`

### Error Handling

The SDK throws typed errors:

```typescript
import { AuthenticationError, APIError, NetworkError } from '@blindfold/sdk';

try {
  await client.tokenize("...");
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle invalid API key
  } else if (error instanceof APIError) {
    // Handle API error (e.g. validation)
  } else if (error instanceof NetworkError) {
    // Handle network issues
  }
}
```
