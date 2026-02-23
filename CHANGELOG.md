# Changelog

All notable changes to Blindfold SDKs will be documented in this file.

## Python SDK

### [1.0.0] - 2026-02-08

- Initial release
- Tokenize, detokenize, detect, redact, mask, synthesize, hash, encrypt methods
- Sync (`Blindfold`) and async (`AsyncBlindfold`) clients
- Pydantic response models
- Comprehensive error handling

## JavaScript SDK

### [1.4.0] - 2026-02-23

- Add built-in regex PII scanner for offline detection (no API key required)
- Make `apiKey` optional in `BlindfoldConfig` - SDK works without it using local regex detection
- Add `mode` option to force local or API mode
- Add `PIIScanner` class with support for 20+ entity types across US, EU, and UK locales
- Add validators: Luhn (credit cards), IBAN mod-97, SSN format rules, NHS modulus-11
- Context-required patterns for low-specificity entities (CVV, ZIP, DOB, etc.)
- Add `@blindfold/sdk/regex` subpath export for standalone scanner usage
- Export `PIIScanner` and `EntityType` from main entry point

### [1.0.0] - 2026-02-08

- Initial release
- Tokenize, detokenize, detect, redact, mask, synthesize, hash, encrypt methods
- Full TypeScript support with type definitions
- CommonJS and ESM builds
- Comprehensive error handling
