# Blindfold Python SDK Examples

This directory contains example applications demonstrating how to use the Blindfold Python SDK.

## Running Examples

The examples import from the local source code, so you don't need to install the package first.

1. Set your API key (not needed for offline examples):
```bash
export BLINDFOLD_API_KEY=your-api-key-here
```

2. Run an example:
```bash
python examples/offline_detokenization.py
```

**Note:** Examples import from source (`../src/blindfold`) for easier development. When using the published package, the path setup is not needed.

## Available Examples

### 1. Offline Detokenization (`offline_detokenization.py`) ⭐️ **Start Here!**
Demonstrates client-side detokenization without needing an API key:
- Works completely offline
- No API key required
- Fast and secure (0.14ms for 100 tokens)
- Multiple practical examples

**Run:**
```bash
python examples/offline_detokenization.py
```

### 2. Basic Tokenization (`basic_tokenization.py`)
Demonstrates the fundamental tokenize → process → detokenize flow:
- Tokenizing sensitive data
- Sending to an LLM (simulated)
- Client-side detokenization

**Run:**
```bash
export BLINDFOLD_API_KEY=your-api-key
python examples/basic_tokenization.py
```

### 3. Multiple Methods (`multiple_methods.py`)
Shows all anonymization methods available:
- Tokenize (reversible)
- Mask (partial visibility)
- Redact (permanent removal)
- Hash (deterministic)
- Synthesize (fake data)

**Run:**
```bash
export BLINDFOLD_API_KEY=your-api-key
python examples/multiple_methods.py
```

### 4. OpenAI Integration (`with_openai.py`)
Real-world example with OpenAI:
- Protecting PII before sending to OpenAI
- Using policy-based detection (GDPR)
- Restoring original data in responses

**Run:**
```bash
# Set both API keys
export BLINDFOLD_API_KEY=your-blindfold-key
export OPENAI_API_KEY=your-openai-key

python examples/with_openai.py
```

### 5. Async Usage (`async_example.py`)
Demonstrates async/await patterns:
- Using AsyncBlindfold client
- Context manager pattern
- Running operations in parallel

**Run:**
```bash
export BLINDFOLD_API_KEY=your-api-key
python examples/async_example.py
```

## Environment Variables

- `BLINDFOLD_API_KEY` - Your Blindfold API key (required for API calls, not needed for offline detokenization)
- `OPENAI_API_KEY` - Your OpenAI API key (required only for OpenAI example)

## Installing OpenAI (Optional)

For the OpenAI integration example:
```bash
pip install openai
```

Then uncomment the OpenAI-related code in `with_openai.py`.

## Need Help?

- Documentation: https://docs.blindfold.dev
- Support: support@blindfold.dev
- Issues: https://github.com/blindfold-dev/blindfold-github/issues
