"""
Offline Detokenization Example

This example demonstrates client-side detokenization which:
- Works without an API key
- Works offline (no network required)
- Is fast (no API latency)
- Is secure (data never leaves your machine)

This is useful for testing and understanding how detokenization works.
"""

import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import Blindfold


def main():
    print("=" * 60)
    print("CLIENT-SIDE DETOKENIZATION DEMO")
    print("(No API key required - runs completely offline)")
    print("=" * 60)
    print()

    # Create a client (API key not needed for detokenization)
    client = Blindfold(api_key="not-needed-for-detokenize")

    # Example 1: Simple detokenization
    print("Example 1: Simple Detokenization")
    print("-" * 60)
    tokenized_text1 = "<Person_1> called <Person_2> yesterday"
    mapping1 = {
        "<Person_1>": "Alice Johnson",
        "<Person_2>": "Bob Smith",
    }

    print(f"Tokenized: {tokenized_text1}")
    print(f"Mapping: {mapping1}")

    result1 = client.detokenize(tokenized_text1, mapping1)
    print(f"Detokenized: {result1.text}")
    print(f"Replacements made: {result1.replacements_made}")
    print()

    # Example 2: Email and PII
    print("Example 2: Email and PII")
    print("-" * 60)
    tokenized_text2 = (
        "Contact <Person_1> at <Email Address_1> or call <Phone Number_1>"
    )
    mapping2 = {
        "<Person_1>": "Sarah Williams",
        "<Email Address_1>": "sarah.williams@company.com",
        "<Phone Number_1>": "+1-555-0123",
    }

    print(f"Tokenized: {tokenized_text2}")
    result2 = client.detokenize(tokenized_text2, mapping2)
    print(f"Detokenized: {result2.text}")
    print(f"Replacements made: {result2.replacements_made}")
    print()

    # Example 3: Repeated tokens
    print("Example 3: Repeated Tokens")
    print("-" * 60)
    tokenized_text3 = "<Person_1> met <Person_2> and <Person_1> introduced <Person_2> to <Person_3>"
    mapping3 = {
        "<Person_1>": "Charlie",
        "<Person_2>": "Diana",
        "<Person_3>": "Eve",
    }

    print(f"Tokenized: {tokenized_text3}")
    result3 = client.detokenize(tokenized_text3, mapping3)
    print(f"Detokenized: {result3.text}")
    print(f"Replacements made: {result3.replacements_made}")
    print()

    # Example 4: LLM Response Simulation
    print("Example 4: Simulated LLM Response")
    print("-" * 60)
    print("Scenario: User asks AI about their account")

    user_query = "My email is <Email Address_1> and phone is <Phone Number_1>"
    llm_response = (
        "I found your account for <Email Address_1>. "
        "I'll send a verification code to <Phone Number_1>. "
        "Please check your phone."
    )

    mapping4 = {
        "<Email Address_1>": "user@example.com",
        "<Phone Number_1>": "+1-555-9876",
    }

    print(f"User (tokenized): {user_query}")
    print(f"LLM Response (tokenized): {llm_response}")
    print()

    detokenized = client.detokenize(llm_response, mapping4)
    print(f"LLM Response (to user): {detokenized.text}")
    print(f"Replacements made: {detokenized.replacements_made}")
    print()

    # Performance demo
    print("=" * 60)
    print("PERFORMANCE DEMO")
    print("=" * 60)

    large_mapping = {f"<Person_{i}>": f"Person {i}" for i in range(1, 101)}
    large_text = " ".join(large_mapping.keys())

    print(f"Processing {len(large_mapping)} tokens...")

    import time

    start_time = time.time()
    large_result = client.detokenize(large_text, large_mapping)
    end_time = time.time()

    print(f"Replacements made: {large_result.replacements_made}")
    print(f"Time taken: {(end_time - start_time) * 1000:.2f}ms")
    print()

    print("=" * 60)
    print("✅ All examples completed successfully!")
    print("💡 Remember: Detokenization is client-side, secure, and fast!")
    print("=" * 60)


if __name__ == "__main__":
    main()
