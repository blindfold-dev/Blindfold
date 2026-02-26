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

    # Summary
    print("=" * 65)
    print("All 8 methods ran offline — zero network calls, zero API keys.")


if __name__ == "__main__":
    main()
