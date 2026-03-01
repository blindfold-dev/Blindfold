# Blindfold .NET SDK

Official .NET SDK for the [Blindfold](https://blindfold.dev) PII detection and anonymization API.

## Installation

```bash
dotnet add package Blindfold.Sdk
```

**Zero external dependencies** — uses only built-in .NET libraries (System.Text.Json).

Targets `net6.0`, `net8.0`, and `netstandard2.1`.

## Quick Start

```csharp
using Blindfold.Sdk;

// API mode
using var client = new BlindfoldClient("your-api-key");

// Local mode (no API key needed)
using var client = new BlindfoldClient();

// Detect PII
var result = await client.DetectAsync("Contact john@example.com or call 555-123-4567");
foreach (var entity in result.DetectedEntities)
{
    Console.WriteLine($"{entity.Type}: {entity.Text} (score: {entity.Score:F2})");
}
```

## Usage

### Client Configuration

```csharp
using var client = new BlindfoldClient(new BlindfoldOptions
{
    ApiKey = "your-api-key",
    Region = "eu",                        // "eu" (default) or "us"
    Locales = new[] { "us", "eu" },
    MaxRetries = 3,
    Timeout = TimeSpan.FromSeconds(30),
    Policy = "gdpr_eu",
    UserId = "user-123",
});
```

### Detect

```csharp
var result = await client.DetectAsync(text);
var result = await client.DetectAsync(text, new[] { "Email Address", "Phone Number" });
var result = await client.DetectAsync(text, "gdpr_eu");
```

### Tokenize

```csharp
var result = await client.TokenizeAsync("Email: alice@example.com");
// result.Text: "Email: <Email Address_1>"
// result.Mapping: {"<Email Address_1>": "alice@example.com"}
```

### Detokenize

```csharp
var result = client.Detokenize(tokenizedText, mapping);
// result.Text: original text restored
```

### Redact

```csharp
var result = await client.RedactAsync("Email: alice@example.com");
// result.Text: "Email:"
```

### Mask

```csharp
var result = await client.MaskAsync("SSN: 123-45-6789", 4, true, "*",
    new[] { "Social Security Number" });
// result.Text: "SSN: *****-6789"
```

### Hash

```csharp
var result = await client.HashAsync("Email: alice@example.com",
    "SHA-256", "HASH_", 16, new[] { "Email Address" });
```

### Encrypt

```csharp
var result = await client.EncryptAsync("Email: alice@example.com", "my-encryption-key-16char");
```

### Synthesize

```csharp
var result = await client.SynthesizeAsync("Email: alice@example.com");
// result.Text: "Email: user3f8a1b2c@example.com"
```

### Batch Operations

```csharp
var texts = new[] { "Email: alice@example.com", "SSN: 123-45-6789" };
var results = await client.DetectBatchAsync(texts, "gdpr_eu");
```

## Policies

Built-in policies: `basic`, `gdpr_eu`, `hipaa_us`, `pci_dss`, `strict`.

```csharp
// Use a policy
var result = await client.DetectAsync(text, "gdpr_eu");

// Load custom policies
using var client = new BlindfoldClient(new BlindfoldOptions
{
    PoliciesFile = "custom-policies.json"
});
```

## Local Mode

When no API key is provided, or `Mode = "local"` is set, the SDK runs entirely locally using 86 regex-based detectors covering 80+ entity types across 30+ countries.

```csharp
using var client = new BlindfoldClient();  // local-only, zero network calls
var result = await client.DetectAsync("My email is test@example.com");
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

```csharp
using Blindfold.Sdk.Errors;

try
{
    var result = await client.DetectAsync(text);
}
catch (AuthenticationException ex)
{
    // Invalid API key
}
catch (ApiException ex)
{
    // API error with status code
    Console.WriteLine($"Status: {ex.StatusCode}");
}
catch (NetworkException ex)
{
    // Network error
}
catch (BlindfoldException ex)
{
    // Base exception
}
```

## HttpClient Integration

The SDK supports `IHttpClientFactory` for advanced scenarios:

```csharp
var httpClient = httpClientFactory.CreateClient("Blindfold");
using var client = new BlindfoldClient(new BlindfoldOptions
{
    ApiKey = "your-api-key",
    HttpClient = httpClient
});
```

## License

MIT
