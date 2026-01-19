# Blindfold JS SDK

The official JavaScript/TypeScript SDK for Blindfold - The Privacy API for AI.

Securely tokenize, mask, redact, and encrypt sensitive data (PII) before sending it to LLMs or third-party services.

## Prerequisites

To use this SDK, you need a Blindfold API key.

1.  **Register** for a free account at [https://app.blindfold.dev/](https://app.blindfold.dev/).
2.  **Create an API Key** in the dashboard at [https://app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys).

## Installation

```bash
npm install @blindfold/sdk
# or
yarn add @blindfold/sdk
# or
pnpm add @blindfold/sdk
```

## Usage

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

Replace sensitive data with reversible tokens (e.g., `<PERSON_1>`).

```typescript
const response = await client.tokenize(
  "Contact John Doe at john@example.com",
  {
    // Optional: Filter specific entities
    entities: ['PERSON', 'EMAIL_ADDRESS'],
    // Optional: Set confidence threshold
    score_threshold: 0.4
  }
);

console.log(response.text); 
// "Contact <PERSON_1> at <EMAIL_ADDRESS_1>"

console.log(response.mapping);
// { "<PERSON_1>": "John Doe", "<EMAIL_ADDRESS_1>": "john@example.com" }
```

### Detokenize

Restore original values from tokens.

```typescript
const original = await client.detokenize(
  "AI response for <PERSON_1>",
  response.mapping
);

console.log(original.text);
// "AI response for John Doe"
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
    entities: ['PASSWORD'] // If supported
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
- `PERSON`
- `EMAIL_ADDRESS`
- `PHONE_NUMBER`
- `CREDIT_CARD`
- `IP_ADDRESS`
- `LOCATION`
- `DATE_TIME`
- `URL`
- `IBAN_CODE`
- `US_SSN`
- `MEDICAL_LICENSE`

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
