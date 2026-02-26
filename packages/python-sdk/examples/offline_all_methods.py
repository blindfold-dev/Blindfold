"""
Offline All Methods Example

Every Blindfold method works offline — no API key, no network.
This example demonstrates all 8 operations running locally:

1. Detect     — find PII without modifying text
2. Redact     — replace PII with entity-name placeholders
3. Tokenize   — replace PII with numbered tokens (reversible)
4. Detokenize — restore original values from tokens
5. Mask       — partially hide PII (show first/last N chars)
6. Hash       — replace PII with deterministic hashes
7. Synthesize — replace PII with realistic fake data
8. Encrypt    — replace PII with AES-encrypted values
"""

import json
import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import Blindfold


def main():
    # No API key — everything runs locally
    client = Blindfold()

    text = "Email support@acme.com, SSN 123-45-6789, card 4532015112830366"
    print("OFFLINE MODE — All Methods (no API key)")
    print("=" * 65)
    print(f"Input: {text}")
    print()

    # 1. Detect
    print("1. DETECT")
    detected = client.detect(text)
    print(f"   Found {detected.entities_count} entities:")
    for e in detected.detected_entities:
        print(f"   - {e.type}: \"{e.text}\" [{e.start}:{e.end}] score={e.score}")
    print()

    # 2. Redact
    print("2. REDACT")
    redacted = client.redact(text)
    print(f"   {redacted.text}")
    print()

    # 3. Tokenize
    print("3. TOKENIZE")
    tokenized = client.tokenize(text)
    print(f"   {tokenized.text}")
    mapping_str = json.dumps(tokenized.mapping, indent=2).replace("\n", "\n   ")
    print(f"   Mapping: {mapping_str}")
    print()

    # 4. Detokenize
    print("4. DETOKENIZE")
    restored = client.detokenize(tokenized.text, tokenized.mapping)
    print(f"   {restored.text}")
    print(f"   Replacements: {restored.replacements_made}")
    print()

    # 5. Mask
    print("5. MASK (last 4 chars visible)")
    masked = client.mask(text, chars_to_show=4, from_end=True)
    print(f"   {masked.text}")
    print()

    # 6. Hash
    print("6. HASH (deterministic)")
    hashed = client.hash(text, hash_length=8)
    print(f"   {hashed.text}")
    hashed2 = client.hash(text, hash_length=8)
    print(f"   Same input = same hash: {hashed.text == hashed2.text}")
    print()

    # 7. Synthesize
    print("7. SYNTHESIZE (format-preserving fake data)")
    synth1 = client.synthesize(text)
    print(f"   Call 1: {synth1.text}")
    synth2 = client.synthesize(text)
    print(f"   Call 2: {synth2.text}")
    print("   (Each call produces different results)")
    print()

    # 8. Encrypt
    print("8. ENCRYPT (AES-256-CBC)")
    encrypted = client.encrypt(text, encryption_key="my-secret-key-at-least-16-chars")
    print(f"   {encrypted.text}")
    print()

    # ─── MULTI-LOCALE DETECTION ────────────────────────────────────
    print("MULTI-LOCALE DETECTION")
    print("=" * 65)
    print()

    # EU locale — IBAN detection
    print("9. EU LOCALE — IBAN")
    eu_client = Blindfold(locales=["eu"])
    eu_text = "Wire to IBAN DE89370400440532013000 please"
    eu_result = eu_client.detect(eu_text)
    print(f"   Input: {eu_text}")
    print(f"   Found {eu_result.entities_count} entities:")
    for e in eu_result.detected_entities:
        print(f'   - {e.type}: "{e.text}"')
    print()

    # UK locale — NI number
    print("10. UK LOCALE — National Insurance Number")
    uk_client = Blindfold(locales=["uk"])
    uk_text = "NI number: AB 12 34 56 A"
    uk_result = uk_client.detect(uk_text)
    print(f"   Input: {uk_text}")
    print(f"   Found {uk_result.entities_count} entities:")
    for e in uk_result.detected_entities:
        print(f'   - {e.type}: "{e.text}"')
    print()

    # CZ locale — Czech Birth Number
    print("11. CZ LOCALE — Czech Birth Number")
    cz_client = Blindfold(locales=["cz"])
    cz_text = "Rodne cislo: 710319/2745"
    cz_result = cz_client.detect(cz_text)
    print(f"   Input: {cz_text}")
    print(f"   Found {cz_result.entities_count} entities:")
    for e in cz_result.detected_entities:
        print(f'   - {e.type}: "{e.text}"')
    print()

    # Entity filtering — only Email Address, SSN ignored
    print("12. ENTITY FILTER — only Email Address")
    email_only = Blindfold(entities=["Email Address"])
    filter_text = "Email support@acme.com, SSN 123-45-6789"
    filter_result = email_only.detect(filter_text)
    print(f"   Input: {filter_text}")
    print(f"   Found {filter_result.entities_count} entities (SSN ignored):")
    for e in filter_result.detected_entities:
        print(f'   - {e.type}: "{e.text}"')
    print()

    # Combined — locales + entities
    print("13. COMBINED — locales: [cz] + entities: [Czech Birth Number]")
    combined = Blindfold(locales=["cz"], entities=["Czech Birth Number"])
    combined_text = "Rodne cislo: 710319/2745, email test@example.com"
    combined_result = combined.detect(combined_text)
    print(f"   Input: {combined_text}")
    print(f"   Found {combined_result.entities_count} entities (email ignored):")
    for e in combined_result.detected_entities:
        print(f'   - {e.type}: "{e.text}"')
    print()

    # Summary
    print("=" * 65)
    print("All 8 methods ran offline — zero network calls, zero API keys.")
    print("Multi-locale detection supports EU, UK, CZ, and more.")


if __name__ == "__main__":
    main()
