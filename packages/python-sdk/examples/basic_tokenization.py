"""
Basic Tokenization Example

This example demonstrates how to:
1. Tokenize sensitive data
2. Send tokenized data to an LLM
3. Detokenize the response
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import Blindfold


def simulate_llm_call(tokenized_text: str) -> str:
    """Simulate an LLM response that includes the tokens"""
    # Extract tokens using regex to handle tokens with spaces like <Email Address_1>
    import re
    tokens = re.findall(r'<[^>]+>', tokenized_text)
    person_token = tokens[0] if len(tokens) > 0 else '<Person_1>'
    email_token = tokens[1] if len(tokens) > 1 else '<Email Address_1>'

    return f"Hello! I can help {person_token} with their request. I'll send the information to {email_token}"


def main():
    # Initialize the client
    client = Blindfold(
        api_key=os.getenv("BLINDFOLD_API_KEY", "your-api-key-here"),
        user_id="user_123",  # Optional: for audit logs
    )

    # Original text with sensitive data
    sensitive_text = "My name is John Doe and my email is john.doe@example.com"
    print(f"Original text: {sensitive_text}")
    print()

    # Step 1: Tokenize the sensitive data
    print("Step 1: Tokenizing...")
    tokenized = client.tokenize(
        text=sensitive_text,
        policy="basic",  # Use a predefined policy
        score_threshold=0.4,  # Confidence threshold
    )

    print(f"Tokenized text: {tokenized.text}")
    print(f"Mapping: {tokenized.mapping}")
    print(f"Entities found: {tokenized.entities_count}")
    print()

    # Step 2: Send tokenized text to your LLM (simulated)
    print("Step 2: Sending to LLM...")
    llm_response = simulate_llm_call(tokenized.text)
    print(f"LLM Response: {llm_response}")
    print()

    # Step 3: Detokenize the response (client-side, no API call)
    print("Step 3: Detokenizing...")
    detokenized = client.detokenize(llm_response, tokenized.mapping)
    print(f"Final response: {detokenized.text}")
    print(f"Replacements made: {detokenized.replacements_made}")


if __name__ == "__main__":
    main()
