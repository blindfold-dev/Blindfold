# Blindfold Go SDK

Official Go SDK for the [Blindfold](https://blindfold.dev) PII detection and anonymization API.

## Installation

```bash
go get github.com/blindfold-dev/Blindfold/packages/go-sdk
```

**Zero external dependencies** — uses only the Go standard library.

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    blindfold "github.com/blindfold-dev/Blindfold/packages/go-sdk"
)

func main() {
    // API mode
    client := blindfold.New(blindfold.WithAPIKey("your-api-key"))

    // Local mode (no API key needed)
    client = blindfold.New()

    ctx := context.Background()

    // Detect PII
    result, err := client.Detect(ctx, "Contact john@example.com or call 555-123-4567")
    if err != nil {
        log.Fatal(err)
    }
    for _, entity := range result.DetectedEntities {
        fmt.Printf("%s: %s (score: %.2f)\n", entity.Type, entity.Text, entity.Score)
    }
}
```

## Usage

### Client Configuration

```go
// Full configuration
client := blindfold.New(
    blindfold.WithAPIKey("your-api-key"),
    blindfold.WithRegion("eu"),          // "eu" (default) or "us"
    blindfold.WithLocales([]string{"us", "eu"}),
    blindfold.WithMaxRetries(3),
    blindfold.WithTimeout(30 * time.Second),
    blindfold.WithPolicy("gdpr_eu"),
    blindfold.WithUserID("user-123"),
)
```

### Detect

```go
result, _ := client.Detect(ctx, text)
result, _ := client.Detect(ctx, text, blindfold.WithEntities([]string{"Email Address", "Phone Number"}))
result, _ := client.Detect(ctx, text, blindfold.WithCallPolicy("gdpr_eu"))
```

### Tokenize

```go
result, _ := client.Tokenize(ctx, "Email: alice@example.com")
// result.Text: "Email: <Email Address_1>"
// result.Mapping: {"<Email Address_1>": "alice@example.com"}
```

### Detokenize

```go
result := client.Detokenize(tokenizedText, mapping)
// result.Text: original text restored
```

### Redact

```go
result, _ := client.Redact(ctx, "Email: alice@example.com")
// result.Text: "Email:"
```

### Mask

```go
result, _ := client.Mask(ctx, "SSN: 123-45-6789",
    blindfold.WithCharsToShow(4),
    blindfold.WithFromEnd(true),
    blindfold.WithMaskingChar("*"),
)
// result.Text: "SSN: *****-6789"
```

### Hash

```go
result, _ := client.Hash(ctx, "Email: alice@example.com",
    blindfold.WithHashType("SHA-256"),
    blindfold.WithHashPrefix("HASH_"),
    blindfold.WithHashLength(16),
)
```

### Encrypt

```go
result, _ := client.Encrypt(ctx, "Email: alice@example.com", "my-encryption-key-16char")
```

### Synthesize

```go
result, _ := client.Synthesize(ctx, "Email: alice@example.com")
// result.Text: "Email: user3f8a1b2c@example.com"
```

### Batch Operations

```go
texts := []string{"Email: alice@example.com", "SSN: 123-45-6789"}
results, _ := client.DetectBatch(ctx, texts, blindfold.WithCallPolicy("gdpr_eu"))
```

## Policies

Built-in policies: `basic`, `gdpr_eu`, `hipaa_us`, `pci_dss`, `strict`.

```go
// Use a policy
result, _ := client.Detect(ctx, text, blindfold.WithCallPolicy("gdpr_eu"))

// Load custom policies
client := blindfold.New(blindfold.WithPoliciesFile("custom-policies.json"))
```

## Local Mode

When no API key is provided, or `WithMode("local")` is set, the SDK runs entirely locally using 86 regex-based detectors covering 80+ entity types across 30+ countries.

```go
client := blindfold.New()  // local-only, zero network calls
result, _ := client.Detect(ctx, "My email is test@example.com")
```

## Supported Entity Types

80+ entity types including:

- **Universal**: Email, Credit Card, Phone, IP Address, URL, MAC Address, Date of Birth, CVV
- **US**: SSN, Driver's License, Passport, Tax ID, ZIP Code, ITIN
- **UK**: NI Number, NHS Number, Postcode, Passport, UTR
- **EU**: IBAN, Postal Code, VAT ID
- **Germany**: Personal ID, Tax ID
- **France**: National ID (NIR), SIREN
- **Spain**: DNI, NIE, NSS, CIF
- **Italy**: Codice Fiscale, Partita IVA
- **And 50+ more** across Nordics, Benelux, Eastern Europe, Baltics, Americas, and Asia-Pacific

## Error Handling

```go
result, err := client.Detect(ctx, text)
if err != nil {
    var authErr *blindfold.AuthenticationError
    var apiErr *blindfold.APIError
    var netErr *blindfold.NetworkError

    switch {
    case errors.As(err, &authErr):
        // Invalid API key
    case errors.As(err, &apiErr):
        // API error with status code
    case errors.As(err, &netErr):
        // Network error
    }
}
```

## License

MIT
