# Blindfold Python SDK

The official Python SDK for Blindfold - The Privacy API for AI.

Securely tokenize, mask, redact, and encrypt sensitive data (PII) before sending it to LLMs or third-party services.

## Prerequisites

To use this SDK, you need a Blindfold API key.

1.  **Register** for a free account at [https://app.blindfold.dev/](https://app.blindfold.dev/).
2.  **Create an API Key** in the dashboard at [https://app.blindfold.dev/api-keys](https://app.blindfold.dev/api-keys).

## Installation

```bash
pip install blindfold-sdk
```

## Usage

### Initialization

```python
from blindfold import Blindfold

client = Blindfold(
    api_key="your-api-key-here",
    # Optional: Track specific end-user for audit logs
    user_id="user_123"
)
```

### Tokenize (Reversible)

Replace sensitive data with reversible tokens (e.g., `<PERSON_1>`).

```python
response = client.tokenize(
    text="Contact John Doe at john@example.com",
    config={
        "entities": ["PERSON", "EMAIL_ADDRESS"],
        "score_threshold": 0.4
    }
)

print(response.text)
# "Contact <PERSON_1> at <EMAIL_ADDRESS_1>"

print(response.mapping)
# { "<PERSON_1>": "John Doe", "<EMAIL_ADDRESS_1>": "john@example.com" }
```

### Detokenize

Restore original values from tokens.

```python
original = client.detokenize(
    text="AI response for <PERSON_1>",
    mapping=response.mapping
)

print(original.text)
# "AI response for John Doe"
```

### Mask

Partially hide sensitive data (e.g., `****-****-****-1234`).

```python
response = client.mask(
    text="Credit card: 4532-7562-9102-3456",
    masking_char="*",
    chars_to_show=4,
    from_end=True
)

print(response.text)
# "Credit card: ***************3456"
```

### Redact

Permanently remove sensitive data.

```python
response = client.redact(
    text="My password is secret123"
)
```

### Hash

Replace data with deterministic hashes (useful for analytics/matching).

```python
response = client.hash(
    text="User ID: 12345",
    hash_type="sha256",
    hash_prefix="ID_"
)
```

### Synthesize

Replace real data with realistic fake data.

```python
response = client.synthesize(
    text="John lives in New York",
    language="en"
)

print(response.text)
# "Michael lives in Boston" (example)
```

### Encrypt

Encrypt sensitive data using AES (reversible with key).

```python
response = client.encrypt(
    text="Secret message",
    encryption_key="your-secure-key-min-16-chars"
)
```

## Async Usage

The SDK also supports asyncio:

```python
import asyncio
from blindfold import AsyncBlindfold

async def main():
    async with AsyncBlindfold(api_key="...") as client:
        response = await client.tokenize("Hello John")
        print(response.text)

asyncio.run(main())
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

The SDK raises specific exceptions:

```python
from blindfold.errors import AuthenticationError, APIError, NetworkError

try:
    client.tokenize("...")
except AuthenticationError:
    # Handle invalid API key
    pass
except APIError as e:
    # Handle API error (e.g. validation)
    print(e)
except NetworkError:
    # Handle network issues
    pass
```
