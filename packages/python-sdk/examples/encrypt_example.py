"""
Encrypt PII Example

This example demonstrates encrypting sensitive data in text using AES encryption.
Encrypted values can be decrypted later with the same key — useful for secure
storage and transmission where you need to recover the original data.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import Blindfold


def main():
    client = Blindfold(api_key=os.getenv("BLINDFOLD_API_KEY", "your-api-key-here"))

    text = "Contact John Doe at john.doe@example.com or call +1-555-0123"
    print(f"Original: {text}")
    print("=" * 60)
    print()

    # 1. Encrypt with server-managed key (tenant key)
    print("1. ENCRYPT (Server-managed key)")
    result = client.encrypt(text=text)
    print(f"   Result: {result.text}")
    print(f"   Entities encrypted: {result.entities_count}")
    print()

    # 2. Encrypt with custom password
    print("2. ENCRYPT (Custom password)")
    result = client.encrypt(text=text, encryption_key="my-secret-password")
    print(f"   Result: {result.text}")
    print(f"   Entities encrypted: {result.entities_count}")
    print()

    # 3. Encrypt with policy
    print("3. ENCRYPT WITH POLICY")
    medical = "Patient Sarah Johnson, SSN 123-45-6789, email sarah@example.com"
    print(f"   Text: {medical}")
    result = client.encrypt(text=medical, policy="hipaa_us")
    print(f"   Result: {result.text}")
    print(f"   Entities encrypted: {result.entities_count}")


if __name__ == "__main__":
    main()
