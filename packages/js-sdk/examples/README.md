# Blindfold JS SDK Examples

This directory contains example applications demonstrating how to use the Blindfold SDK.

## Running Examples

1. Install dependencies:
```bash
cd packages/js-sdk
npm install
```

2. Set your API key:
```bash
export BLINDFOLD_API_KEY=your-api-key-here
```

3. Run an example:
```bash
npx tsx examples/basic-tokenization.ts
```

**Note:** Examples import from source (`../src/index`) for easier development. When using the published package, import from `@blindfold/sdk` instead.

## Available Examples

### 1. Offline Detokenization (`offline-detokenization.ts`) ⭐️ **Start Here!**
Demonstrates client-side detokenization without needing an API key:
- Works completely offline
- No API key required
- Fast and secure
- Multiple practical examples

**Run:**
```bash
npx tsx examples/offline-detokenization.ts
```

### 2. Basic Tokenization (`basic-tokenization.ts`)
Demonstrates the fundamental tokenize → process → detokenize flow:
- Tokenizing sensitive data
- Sending to an LLM (simulated)
- Client-side detokenization

**Run:**
```bash
npx tsx examples/basic-tokenization.ts
```

### 3. Multiple Methods (`multiple-methods.ts`)
Shows all anonymization methods available:
- Tokenize (reversible)
- Mask (partial visibility)
- Redact (permanent removal)
- Hash (deterministic)
- Synthesize (fake data)

**Run:**
```bash
npx tsx examples/multiple-methods.ts
```

### 4. OpenAI Integration (`with-openai.ts`)
Real-world example with OpenAI:
- Protecting PII before sending to OpenAI
- Using policy-based detection (GDPR)
- Restoring original data in responses

**Run:**
```bash
# Set both API keys
export BLINDFOLD_API_KEY=your-blindfold-key
export OPENAI_API_KEY=your-openai-key

npx tsx examples/with-openai.ts
```

## Installing tsx

If you don't have `tsx` installed, install it globally:
```bash
npm install -g tsx
```

Or use it directly with npx (no installation needed):
```bash
npx tsx examples/basic-tokenization.ts
```

## Environment Variables

- `BLINDFOLD_API_KEY` - Your Blindfold API key (required)
- `OPENAI_API_KEY` - Your OpenAI API key (required only for OpenAI example)

## Need Help?

- Documentation: https://docs.blindfold.dev
- Support: support@blindfold.dev
- Issues: https://github.com/blindfold-dev/blindfold-github/issues
