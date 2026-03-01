# Blindfold Java SDK

Java SDK for [Blindfold](https://blindfold.dev) PII detection and anonymization. Supports offline regex-based scanning (80+ entity types, zero network calls) and online API mode (GLiNER NER for names, addresses, organizations across 18+ languages).

## Requirements

- Java 11+
- No additional dependencies for offline mode (regex only)
- Gson for JSON serialization (included)

## Installation

### Maven

```xml
<dependency>
    <groupId>dev.blindfold</groupId>
    <artifactId>blindfold-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'dev.blindfold:blindfold-sdk:1.0.0'
```

## Quick Start

### Local Mode (Offline, No API Key)

```java
import dev.blindfold.sdk.Blindfold;
import dev.blindfold.sdk.models.*;

// No API key = automatic local mode
Blindfold client = new Blindfold();

DetectResponse response = client.detect("Email john@acme.com, SSN 123-45-6789");
for (DetectedEntity entity : response.getDetectedEntities()) {
    System.out.println(entity.getType() + ": " + entity.getText());
}
// Output:
// Email Address: john@acme.com
// Social Security Number: 123-45-6789
```

### API Mode (Online, GLiNER NER)

```java
import dev.blindfold.sdk.Blindfold;
import dev.blindfold.sdk.BlindfoldOptions;

Blindfold client = new Blindfold(BlindfoldOptions.builder()
    .apiKey("your-api-key")
    .region("eu")  // "eu" or "us"
    .build());

// Detects Person, Organization, Address entities via GLiNER
DetectResponse response = client.detect("John Smith works at Acme Corp in Berlin");
```

### Force Local Mode (With API Key)

```java
Blindfold client = new Blindfold(BlindfoldOptions.builder()
    .apiKey("your-api-key")
    .mode("local")  // Forces offline regex scanning
    .build());
```

## Operations

### Detect

Find PII entities in text.

```java
DetectResponse response = client.detect("Call (555) 123-4567");
```

### Tokenize

Replace PII with numbered tokens like `<Email Address_1>`.

```java
TokenizeResponse response = client.tokenize("Email john@acme.com and jane@acme.com");
// response.getText() = "Email <Email Address_1> and <Email Address_2>"
// response.getMapping() = {"<Email Address_1>": "john@acme.com", "<Email Address_2>": "jane@acme.com"}
```

### Detokenize

Restore tokenized text to original.

```java
DetokenizeResponse response = client.detokenize(tokenized.getText(), tokenized.getMapping());
// response.getText() = "Email john@acme.com and jane@acme.com"
```

### Redact

Remove PII from text entirely.

```java
RedactResponse response = client.redact("SSN: 123-45-6789");
// response.getText() = "SSN:"
```

### Mask

Partially mask PII values.

```java
MaskResponse response = client.mask("Card: 4111-1111-1111-1111", 4, true, "*", null);
// response.getText() = "Card: ***************1111"
```

### Hash

Replace PII with deterministic hashes.

```java
HashResponse response = client.hash("Email john@acme.com");
// response.getText() = "Email HASH_a1b2c3d4e5f6..."
```

### Encrypt

Encrypt PII with AES-256-CBC.

```java
EncryptResponse response = client.encrypt("Email john@acme.com", "my-secret-key-16chars");
```

### Synthesize

Replace PII with realistic fake data.

```java
SynthesizeResponse response = client.synthesize("Email john@acme.com");
// response.getText() = "Email user3f8a2b1c@example.com"
```

## Entity Types

The SDK detects 80+ entity types across 35+ countries:

| Category | Entity Types |
|----------|-------------|
| Universal | Email Address, Credit Card Number, Phone Number, IP Address, URL, MAC Address, Date of Birth, CVV |
| US | Social Security Number, Driver's License, US Passport, Tax ID, ZIP Code, US ITIN |
| UK | NI Number, NHS Number, UK Postcode, UK Passport, UK UTR |
| EU | IBAN, Postal Code, VAT ID |
| Germany | German Personal ID, German Tax ID |
| France | French National ID, French SIREN |
| Spain | Spanish DNI, Spanish NIE, Spanish NSS, Spanish CIF |
| Italy | Italian Codice Fiscale, Italian Partita IVA |
| And 25+ more countries... | Brazilian CPF/CNPJ, Indian Aadhaar/PAN, Japanese My Number, etc. |

## Locale Configuration

By default, universal detectors + US locale are active. Add more locales:

```java
Blindfold client = new Blindfold(BlindfoldOptions.builder()
    .locales(List.of("us", "eu", "uk", "de", "fr"))
    .build());
```

Available locales: `us`, `uk`, `eu`, `de`, `fr`, `es`, `it`, `pt`, `pl`, `cz`, `sk`, `ru`, `nl`, `ro`, `dk`, `se`, `no`, `be`, `at`, `ie`, `fi`, `hu`, `bg`, `hr`, `si`, `lt`, `lv`, `ee`, `ca`, `ch`, `au`, `nz`, `in`, `jp`, `kr`, `za`, `tr`, `il`, `ar`, `cl`, `co`, `br`

## Async Client

```java
BlindfoldAsync asyncClient = new BlindfoldAsync(BlindfoldOptions.builder().build());

CompletableFuture<DetectResponse> future = asyncClient.detectAsync("Email john@acme.com");
DetectResponse response = future.get();
```

## Using the Scanner Directly

For maximum control over offline scanning:

```java
import dev.blindfold.sdk.regex.PIIScanner;
import dev.blindfold.sdk.regex.PIIMatch;

PIIScanner scanner = new PIIScanner(List.of("us", "eu"));
List<PIIMatch> matches = scanner.detect("IBAN: DE89 3704 0044 0532 0130 00");

for (PIIMatch match : matches) {
    System.out.printf("%s: %s (%.2f) [%d:%d]%n",
        match.getEntityType(), match.getText(), match.getScore(),
        match.getStart(), match.getEnd());
}
```

## License

MIT
