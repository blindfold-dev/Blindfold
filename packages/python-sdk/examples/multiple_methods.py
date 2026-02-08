"""
Multiple Anonymization Methods Example

This example demonstrates different anonymization methods:
- Tokenize (reversible)
- Detect (scan without modifying)
- Mask (partial visibility)
- Redact (permanent removal)
- Hash (deterministic)
- Synthesize (fake data)
- Encrypt (AES encryption)
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import Blindfold


def main():
    client = Blindfold(api_key=os.getenv("BLINDFOLD_API_KEY", "your-api-key-here"))

    original_text = "Contact John Doe at john.doe@example.com or call +1-555-0123"
    print(f"Original: {original_text}")
    print("=" * 60)
    print()

    # 1. Tokenize (reversible)
    print("1. TOKENIZE (Reversible)")
    tokenized = client.tokenize(text=original_text)
    print(f"   Result: {tokenized.text}")
    print("   Can be reversed: Yes")
    print()

    # 2. Detect (scan without modifying)
    print("2. DETECT (Scan only)")
    detected = client.detect(text=original_text)
    print(f"   Found {detected.entities_count} entities:")
    for entity in detected.detected_entities:
        print(f"   - {entity.entity_type}: \"{entity.text}\"")
    print()

    # 3. Mask (partial visibility)
    print("3. MASK (Partial hiding)")
    masked = client.mask(text=original_text, chars_to_show=3, from_end=True)
    print(f"   Result: {masked.text}")
    print("   Can be reversed: No")
    print()

    # 3. Redact (permanent removal)
    print("4. REDACT (Permanent removal)")
    redacted = client.redact(text=original_text)
    print(f"   Result: {redacted.text}")
    print("   Can be reversed: No")
    print()

    # 4. Hash (deterministic)
    print("5. HASH (Deterministic)")
    hashed = client.hash(text=original_text, hash_type="sha256", hash_length=8)
    print(f"   Result: {hashed.text}")
    print("   Can be reversed: No (but same input = same hash)")
    print()

    # 5. Synthesize (fake data)
    print("6. SYNTHESIZE (Fake data)")
    synthesized = client.synthesize(text=original_text, language="en")
    print(f"   Result: {synthesized.text}")
    print("   Can be reversed: No")
    print()

    # 7. Encrypt (AES encryption)
    print("7. ENCRYPT (AES encryption)")
    encrypted = client.encrypt(text=original_text)
    print(f"   Result: {encrypted.text}")
    print("   Can be reversed: Yes (with the same key)")
    print()

    # Summary
    print("=" * 60)
    print("SUMMARY:")
    print(f"- Tokenized: {tokenized.entities_count} entities")
    print(f"- Detected: {detected.entities_count} entities")
    print(f"- Masked: {masked.entities_count} entities")
    print(f"- Redacted: {redacted.entities_count} entities")
    print(f"- Hashed: {hashed.entities_count} entities")
    print(f"- Synthesized: {synthesized.entities_count} entities")
    print(f"- Encrypted: {encrypted.entities_count} entities")


if __name__ == "__main__":
    main()
