"""
Detect PII Example

This example demonstrates PII detection without modifying the text.
Useful for scanning, auditing, and understanding what sensitive data
exists in your content before deciding how to handle it.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import Blindfold


def main():
    client = Blindfold(api_key=os.getenv("BLINDFOLD_API_KEY", "your-api-key-here"))

    # 1. Basic detection
    print("1. BASIC DETECTION")
    text = "Contact John Doe at john.doe@example.com or call +1-555-0123"
    print(f"   Text: {text}")

    result = client.detect(text=text)
    print(f"   Found {result.entities_count} entities:")
    for entity in result.detected_entities:
        print(f"   - {entity.entity_type}: \"{entity.text}\" (confidence: {entity.score:.2f})")
    print()

    # 2. Detection with specific entities
    print("2. DETECT SPECIFIC ENTITY TYPES")
    text = "Patient Sarah Johnson, SSN 123-45-6789, diagnosed on 2024-03-15"
    print(f"   Text: {text}")

    result = client.detect(text=text, entities=["person", "social security number"])
    print(f"   Found {result.entities_count} entities (filtered):")
    for entity in result.detected_entities:
        print(f"   - {entity.entity_type}: \"{entity.text}\" (confidence: {entity.score:.2f})")
    print()

    # 3. Detection with policy
    print("3. DETECT WITH POLICY")
    text = "Card 4532-7562-9102-3456 was charged $500 on account 987654321"
    print(f"   Text: {text}")

    result = client.detect(text=text, policy="pci_dss")
    print(f"   Found {result.entities_count} entities (PCI-DSS policy):")
    for entity in result.detected_entities:
        print(f"   - {entity.entity_type}: \"{entity.text}\" (confidence: {entity.score:.2f})")
    print()

    # 4. Detection with confidence threshold
    print("4. DETECT WITH CONFIDENCE THRESHOLD")
    text = "Meeting with Dr. Smith at 123 Main St, New York about project Alpha"
    print(f"   Text: {text}")

    result = client.detect(text=text, score_threshold=0.8)
    print(f"   Found {result.entities_count} entities (>80% confidence):")
    for entity in result.detected_entities:
        print(f"   - {entity.entity_type}: \"{entity.text}\" (confidence: {entity.score:.2f})")


if __name__ == "__main__":
    main()
