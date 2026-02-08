# Blindfold Python SDK

The official Python SDK for Blindfold - The Privacy API for AI.

Securely tokenize, mask, redact, and encrypt sensitive data (PII) before sending it to LLMs or third-party services.

## How to use it

### 1. Install SDK
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

### Initialization

```python
from blindfold import Blindfold

client = Blindfold()
```

### Tokenize (Reversible)

Replace sensitive data with reversible tokens (e.g., `<Person_1>`).

```python
response = client.tokenize(
    text="Contact John Doe at john@example.com",
    policy="gdpr_eu",  # Optional: Use a pre-configured policy (e.g., 'hipaa_us', 'basic')
    entities=["person", "email address"],  # Optional: Filter specific entities
    score_threshold=0.4  # Optional: Set confidence threshold
)

print(response.text)
# "Contact <Person_1> at <Email Address_1>"

print(response.mapping)
# { "<Person_1>": "John Doe", "<Email Address_1>": "john@example.com" }
```

### Detokenize

Restore original values from tokens.

**⚡ Note:** Detokenization is performed **client-side** for better performance, security, and offline support. No API call is made.

```python
# Runs locally - no API call!
original = client.detokenize(
    text="AI response for <Person_1>",
    mapping=response.mapping
)

print(original.text)
# "AI response for John Doe"

print(original.replacements_made)
# 1
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

        # Note: detokenize is also synchronous in async client (no await)
        original = client.detokenize(response.text, response.mapping)
        print(original.text)

asyncio.run(main())
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
