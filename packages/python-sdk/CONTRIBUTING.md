# Contributing to Blindfold Python SDK

Thank you for your interest in contributing to the Blindfold Python SDK! This guide will help you get started.

## Development Setup

### Prerequisites

- Python >= 3.8
- pip >= 21.0

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/blindfold-dev/blindfold-github.git
cd blindfold-github/packages/python-sdk
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -e ".[dev]"
```

4. Set up your environment:
```bash
cp .env.example .env
# Edit .env and add your BLINDFOLD_API_KEY
```

## Development Workflow

### Available Commands (Make)

```bash
# Development
make install         # Install dependencies
make build           # Build package

# Testing
make test            # Run tests
make test-cov        # Run tests with coverage

# Code Quality
make lint            # Run all linters
make lint-fix        # Fix linting issues
make format          # Format code
make type-check      # Run type checker

# Validation
make validate        # Run all checks (lint + type + test)
make clean           # Clean build artifacts
```

### Alternative: Using pip/pytest directly

```bash
# Testing
pytest                          # Run tests
pytest -v                       # Verbose output
pytest --cov=blindfold         # With coverage
pytest tests/test_detokenize.py # Specific file

# Linting
ruff check src tests
black src tests
isort src tests

# Type checking
mypy src
```

### Project Structure

```
python-sdk/
├── src/
│   └── blindfold/
│       ├── __init__.py      # Public API exports
│       ├── client.py        # Main SDK client
│       ├── models.py        # Pydantic models
│       └── errors.py        # Exception classes
├── tests/
│   └── test_detokenize.py   # Test files
├── examples/
│   ├── basic_tokenization.py
│   ├── multiple_methods.py
│   ├── with_openai.py
│   └── async_example.py
├── dist/                    # Build output (gitignored)
└── htmlcov/                 # Coverage report (gitignored)
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
- Follow PEP 8 style guidelines
- Add type hints to all functions
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all validations
make validate

# Run specific checks
make lint
make type-check
make test
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

### Python Style

We follow PEP 8 with these tools:
- **Black** for code formatting (line length: 88)
- **isort** for import sorting
- **Ruff** for linting
- **mypy** for type checking

### Type Hints

Always use type hints:

```python
def tokenize(
    self,
    text: str,
    entities: Optional[list] = None,
    policy: Optional[str] = None,
) -> TokenizeResponse:
    """Tokenize text by replacing sensitive information."""
    ...
```

### Docstrings

Use Google-style docstrings:

```python
def detokenize(self, text: str, mapping: Dict[str, str]) -> DetokenizeResponse:
    """
    Detokenize text by replacing tokens with original values.

    Args:
        text: Tokenized text
        mapping: Token mapping from tokenize response

    Returns:
        DetokenizeResponse with original text

    Example:
        >>> client = Blindfold(api_key="...")
        >>> result = client.detokenize("<Person_1>", {"<Person_1>": "John"})
        >>> print(result.text)
        "John"
    """
    ...
```

## Testing Guidelines

### Writing Tests

- Place tests in the `tests/` directory
- Use descriptive test names with `test_` prefix
- Use pytest fixtures for common setup
- Test edge cases and error conditions

Example:

```python
def test_detokenize_simple_text(client):
    """Test detokenizing simple text with single token"""
    # Arrange
    text = "<Person_1> called yesterday"
    mapping = {"<Person_1>": "John Doe"}

    # Act
    result = client.detokenize(text, mapping)

    # Assert
    assert result.text == "John Doe called yesterday"
    assert result.replacements_made == 1
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_detokenize.py

# Run specific test
pytest tests/test_detokenize.py::test_detokenize_simple_text

# With coverage
pytest --cov=blindfold --cov-report=html

# Watch mode (requires pytest-watch)
ptw
```

## Documentation

- Update README.md for user-facing changes
- Add docstrings to all public functions
- Create examples for new features
- Update CHANGELOG.md

## Code Formatting

Before committing, format your code:

```bash
make format
# or
black src tests
isort src tests
```

## Getting Help

- Open an issue for bugs or feature requests
- Join our Discord community
- Email: support@blindfold.dev

## Code of Conduct

Please be respectful and constructive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
