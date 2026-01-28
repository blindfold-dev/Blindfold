"""
Async Usage Example

This example demonstrates how to use the async version of the Blindfold client.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import AsyncBlindfold


async def main():
    # Use async context manager
    async with AsyncBlindfold(
        api_key=os.getenv("BLINDFOLD_API_KEY", "your-api-key-here")
    ) as client:
        # Original text with sensitive data
        text = "Contact Dr. Jane Smith at jane.smith@hospital.com or call +1-555-0199"
        print(f"Original: {text}")
        print()

        # Tokenize asynchronously
        print("Tokenizing...")
        tokenized = await client.tokenize(text=text, policy="hipaa_us")

        print(f"Tokenized: {tokenized.text}")
        print(f"Entities found: {tokenized.entities_count}")
        print()

        # Detokenize (still synchronous even in async client - no API call)
        print("Detokenizing...")
        detokenized = client.detokenize(tokenized.text, tokenized.mapping)

        print(f"Restored: {detokenized.text}")
        print()

        # Multiple operations in parallel
        print("Running multiple operations in parallel...")
        mask_task = client.mask(text=text, chars_to_show=3)
        redact_task = client.redact(text=text)
        hash_task = client.hash(text=text)

        masked, redacted, hashed = await asyncio.gather(
            mask_task, redact_task, hash_task
        )

        print(f"Masked: {masked.text}")
        print(f"Redacted: {redacted.text}")
        print(f"Hashed: {hashed.text}")


if __name__ == "__main__":
    asyncio.run(main())
