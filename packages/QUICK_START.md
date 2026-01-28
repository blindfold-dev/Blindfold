# Quick Start Guide for Developers

## 🚀 Get Started in 5 Minutes

### JavaScript SDK

```bash
# 1. Navigate to JS SDK
cd packages/js-sdk

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Try an example
export BLINDFOLD_API_KEY=your-api-key
npx tsx examples/basic-tokenization.ts

# 5. Build
npm run build

# ✅ All set! Start coding
```

### Python SDK

```bash
# 1. Navigate to Python SDK
cd packages/python-sdk

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -e ".[dev]"

# 4. Run tests
make test

# 5. Try an example
export BLINDFOLD_API_KEY=your-api-key
python examples/basic_tokenization.py

# 6. Build
make build

# ✅ All set! Start coding
```

## 📝 Common Development Tasks

### Run Tests

```bash
# JavaScript
npm test                  # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage

# Python
make test                 # Run once
make test-cov             # With coverage
pytest -v                 # Verbose output
```

### Check Code Quality

```bash
# JavaScript
npm run lint              # Check linting
npm run format:check      # Check formatting
npm run type-check        # Check types
npm run validate          # All checks

# Python
make lint                 # Check linting
make type-check           # Check types
make validate             # All checks
```

### Fix Issues

```bash
# JavaScript
npm run lint:fix          # Auto-fix linting
npm run format            # Auto-format

# Python
make lint-fix             # Auto-fix linting
make format               # Auto-format
```

### Build Package

```bash
# JavaScript
npm run build

# Python
make build
```

## 📚 Project Structure

```
packages/
├── js-sdk/              JavaScript/TypeScript SDK
│   ├── src/            Source code
│   ├── tests/          Unit tests
│   └── examples/       Working examples
│
└── python-sdk/         Python SDK
    ├── src/            Source code
    ├── tests/          Unit tests
    └── examples/       Working examples
```

## 🔍 What to Read Next

1. **For Users:**
   - `packages/js-sdk/README.md`
   - `packages/python-sdk/README.md`
   - `packages/*/examples/README.md`

2. **For Contributors:**
   - `packages/js-sdk/CONTRIBUTING.md`
   - `packages/python-sdk/CONTRIBUTING.md`
   - `packages/STRUCTURE.md`

3. **For Understanding:**
   - `packages/README.md`

## 🎯 Common Workflows

### Adding a New Feature

1. Create a branch: `git checkout -b feature/my-feature`
2. Write code in `src/`
3. Add tests in `tests/`
4. Add example in `examples/`
5. Run validation: `npm run validate` / `make validate`
6. Commit: `git commit -m "feat: add my feature"`
7. Push and create PR

### Fixing a Bug

1. Create a branch: `git checkout -b fix/bug-name`
2. Write a failing test
3. Fix the bug
4. Run tests: `npm test` / `make test`
5. Commit: `git commit -m "fix: resolve bug"`
6. Push and create PR

### Running Examples

```bash
# JavaScript
export BLINDFOLD_API_KEY=your-key
npx tsx examples/basic-tokenization.ts
npx tsx examples/multiple-methods.ts
npx tsx examples/with-openai.ts

# Python
export BLINDFOLD_API_KEY=your-key
python examples/basic_tokenization.py
python examples/multiple_methods.py
python examples/with_openai.py
python examples/async_example.py
```

## 💡 Pro Tips

1. **Use watch mode during development:**
   ```bash
   npm run test:watch    # JS
   pytest -v --looponfail  # Python (requires pytest-watch)
   ```

2. **Check coverage locally:**
   ```bash
   npm run test:coverage && open coverage/index.html  # JS
   make test-cov && open htmlcov/index.html          # Python
   ```

3. **Run only specific tests:**
   ```bash
   npm test -- detokenize.test.ts                     # JS
   pytest tests/test_detokenize.py::test_name         # Python
   ```

4. **Use validation before committing:**
   ```bash
   npm run validate    # Runs type-check + lint + test
   make validate       # Runs lint + type-check + test
   ```

## 🆘 Troubleshooting

### JavaScript Issues

**"Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Type errors"**
```bash
npm run type-check
# Fix the errors shown
```

### Python Issues

**"Module not found"**
```bash
pip install -e ".[dev]"
```

**"Import errors"**
```bash
# Make sure virtual environment is activated
source .venv/bin/activate
```

## 📞 Get Help

- Check CONTRIBUTING.md for detailed guides
- Open an issue on GitHub
- Email: support@blindfold.dev

---

**Ready to code? Pick an SDK and start developing! 🚀**
