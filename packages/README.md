# Blindfold SDK Packages

This directory contains the official open-source SDKs for Blindfold - The Privacy API for AI.

## 📦 Available Packages

### [JavaScript/TypeScript SDK](./js-sdk)
Official JavaScript and TypeScript SDK for Node.js and browser environments.

**Install:**
```bash
npm install @blindfold/sdk
```

**Quick Start:**
```typescript
import { Blindfold } from '@blindfold/sdk'

const client = new Blindfold({ apiKey: 'your-api-key' })
const result = await client.tokenize('John Doe called at john@example.com')
```

### [Python SDK](./python-sdk)
Official Python SDK with both sync and async support.

**Install:**
```bash
pip install blindfold-sdk
```

**Quick Start:**
```python
from blindfold import Blindfold

client = Blindfold(api_key='your-api-key')
result = client.tokenize(text='John Doe called at john@example.com')
```

## 🏗️ Unified Structure

Both SDKs follow a consistent, professional structure:

```
{sdk-name}/
├── src/                    # Source code
├── tests/                  # Test files
├── examples/               # Example applications
├── dist/                   # Build output (gitignored)
├── README.md              # User documentation
├── CONTRIBUTING.md        # Developer guide
└── Configuration files    # Linting, testing, building
```

## 🔧 Development Setup

### JS SDK

```bash
cd js-sdk
npm install
npm test
npm run lint
npm run build
```

### Python SDK

```bash
cd python-sdk
pip install -e ".[dev]"
make test
make lint
make build
```

## ✅ Available Scripts

### JavaScript SDK

| Command | Description |
|---------|-------------|
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint code |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code |
| `npm run type-check` | Type checking |
| `npm run build` | Build package |
| `npm run validate` | Run all checks |

### Python SDK

| Command | Description |
|---------|-------------|
| `make test` | Run tests |
| `make test-cov` | Run tests with coverage |
| `make lint` | Lint code |
| `make lint-fix` | Fix linting issues |
| `make format` | Format code |
| `make type-check` | Type checking |
| `make build` | Build package |
| `make validate` | Run all checks |

## 📚 Examples

Both SDKs include comprehensive examples:

- **Basic Tokenization** - Simple tokenize → process → detokenize flow
- **Multiple Methods** - Demonstrates all anonymization methods
- **OpenAI Integration** - Real-world LLM integration
- **Async Usage** (Python) - Async/await patterns

Run examples:
```bash
# JavaScript
npx tsx examples/basic-tokenization.ts

# Python
python examples/basic_tokenization.py
```

## 🧪 Testing

Both SDKs have comprehensive test suites with coverage reporting:

### Run Tests

```bash
# JavaScript
cd js-sdk && npm test

# Python
cd python-sdk && make test
```

### Coverage Reports

Coverage reports are generated in:
- JS: `js-sdk/coverage/`
- Python: `python-sdk/htmlcov/`

## 🎨 Code Quality

Both SDKs enforce consistent code quality:

### JavaScript
- **ESLint** - Linting
- **Prettier** - Formatting
- **TypeScript** - Type checking
- **Jest** - Testing

### Python
- **Ruff** - Linting
- **Black** - Formatting
- **isort** - Import sorting
- **mypy** - Type checking
- **pytest** - Testing

## 🚀 CI/CD

GitHub Actions workflows are configured for both SDKs:

- **Continuous Integration** - Runs on every push/PR
- **Multi-version Testing** - Tests across Node 16/18/20 and Python 3.8-3.12
- **Code Coverage** - Uploads to Codecov
- **Build Validation** - Ensures packages build correctly

Workflows:
- `.github/workflows/js-sdk-ci.yml`
- `.github/workflows/python-sdk-ci.yml`

## 📖 Documentation

Each SDK includes:
- **README.md** - User-facing documentation
- **CONTRIBUTING.md** - Developer guide
- **Examples** - Practical code examples
- **JSDoc/Docstrings** - Inline API documentation

## 🔑 Key Features

Both SDKs support:

✅ **Tokenization** (reversible)
✅ **Detokenization** (client-side)
✅ **Masking** (partial hiding)
✅ **Redaction** (permanent removal)
✅ **Hashing** (deterministic)
✅ **Synthesis** (fake data)
✅ **Encryption** (AES)
✅ **Policy Support** (GDPR, HIPAA, etc.)
✅ **Error Handling**
✅ **Type Safety**

## 🤝 Contributing

We welcome contributions! Please see:
- [JS SDK Contributing Guide](./js-sdk/CONTRIBUTING.md)
- [Python SDK Contributing Guide](./python-sdk/CONTRIBUTING.md)

## 📄 License

Both SDKs are open source under the [MIT License](../LICENSE).

## 🆘 Support

- Documentation: https://docs.blindfold.dev
- Issues: https://github.com/blindfold-dev/blindfold-github/issues
- Email: support@blindfold.dev
