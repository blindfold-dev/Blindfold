# Contributing to Blindfold JS SDK

Thank you for your interest in contributing to the Blindfold JS SDK! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/blindfold-dev/blindfold-github.git
cd blindfold-github/packages/js-sdk
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment:
```bash
cp .env.example .env
# Edit .env and add your BLINDFOLD_API_KEY
```

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Build in watch mode
npm run build            # Build for production

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run type-check       # Run TypeScript type checking
npm run lint             # Lint code
npm run lint:fix         # Lint and fix issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting

# Validation
npm run validate         # Run all checks (type-check + lint + test)
npm run clean            # Clean build artifacts
```

### Project Structure

```
js-sdk/
├── src/
│   ├── client.ts        # Main SDK client
│   ├── types.ts         # TypeScript types
│   ├── errors.ts        # Error classes
│   └── index.ts         # Public API exports
├── tests/
│   └── detokenize.test.ts  # Test files
├── examples/
│   ├── basic-tokenization.ts
│   ├── multiple-methods.ts
│   └── with-openai.ts
├── dist/               # Build output (gitignored)
└── coverage/           # Test coverage (gitignored)
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all validations
npm run validate

# Run specific checks
npm run type-check
npm run lint
npm test
```

### 4. Commit Your Changes

We use conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in tokenization"
git commit -m "docs: update README"
git commit -m "test: add tests for detokenize"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

### 5. Submit a Pull Request

1. Push your branch:
```bash
git push origin feature/your-feature-name
```

2. Open a pull request on GitHub
3. Describe your changes
4. Link any related issues

## Code Style Guide

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Provide types for all public APIs
- Avoid `any` types when possible

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Use UPPER_CASE for constants

### Comments

- Use JSDoc for public APIs
- Add inline comments for complex logic
- Keep comments concise and meaningful

## Testing Guidelines

### Writing Tests

- Place tests in the `tests/` directory
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern
- Test edge cases and error conditions

Example:
```typescript
describe('detokenize', () => {
  test('should replace tokens with original values', () => {
    // Arrange
    const client = new Blindfold({ apiKey: 'test-key' })
    const text = '<Person_1> called'
    const mapping = { '<Person_1>': 'John' }

    // Act
    const result = client.detokenize(text, mapping)

    // Assert
    expect(result.text).toBe('John called')
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- detokenize.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to public APIs
- Create examples for new features
- Update CHANGELOG.md

## Getting Help

- Open an issue for bugs or feature requests
- Join our Discord community
- Email: support@blindfold.dev

## Code of Conduct

Please be respectful and constructive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
