"""
OpenAI Integration Example

This example shows how to use Blindfold with OpenAI to:
1. Tokenize sensitive data before sending to OpenAI
2. Get the response from OpenAI
3. Detokenize the response to restore original data
"""

import os
import re
import sys
from pathlib import Path

# Add parent directory to path to import from local source
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blindfold import Blindfold

# Uncomment if you have OpenAI installed:
# from openai import OpenAI


def main():
    # Initialize clients
    blindfold = Blindfold(
        api_key=os.getenv("BLINDFOLD_API_KEY", "your-blindfold-key")
    )

    # Uncomment if using OpenAI:
    # openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # User message with sensitive data
    user_message = """
    I need help with my account. My name is Sarah Johnson,
    my email is sarah.johnson@company.com, and my phone is +1-555-0199.
    I was born on 05/15/1990.
    """

    print(f"Original message: {user_message}")
    print()

    # Step 1: Tokenize sensitive data
    print("Step 1: Tokenizing sensitive data...")
    tokenized = blindfold.tokenize(text=user_message, policy="gdpr_eu")

    print(f"Tokenized message: {tokenized.text}")
    print("Detected entities:")
    for entity in tokenized.detected_entities:
        print(f"  - {entity.type}: {entity.text} (score: {entity.score:.2f})")
    print()

    # Step 2: Send to OpenAI (simulated)
    print("Step 2: Sending to OpenAI...")

    # Uncomment to use real OpenAI:
    # completion = openai_client.chat.completions.create(
    #     model="gpt-4",
    #     messages=[
    #         {
    #             "role": "system",
    #             "content": "You are a helpful customer service assistant.",
    #         },
    #         {"role": "user", "content": tokenized.text},
    #     ],
    # )
    # ai_response = completion.choices[0].message.content or ""

    # Simulated response for demo
    person_token = re.search(r"<Person_\d+>", tokenized.text)
    email_token = re.search(r"<Email Address_\d+>", tokenized.text)
    phone_token = re.search(r"<Phone Number_\d+>", tokenized.text)
    date_token = re.search(r"<Date Of Birth_\d+>", tokenized.text)

    ai_response = f"Hello {person_token.group() if person_token else ''}! I'd be happy to help you with your account. I'll send a verification email to {email_token.group() if email_token else ''} and a text to {phone_token.group() if phone_token else ''}. For security, I'll also verify your date of birth {date_token.group() if date_token else ''}."

    print(f"AI Response (tokenized): {ai_response}")
    print()

    # Step 3: Detokenize the response (client-side)
    print("Step 3: Detokenizing response...")
    detokenized = blindfold.detokenize(ai_response, tokenized.mapping)

    print(f"Final response: {detokenized.text}")
    print()

    print("✅ Sensitive data was protected throughout the entire interaction!")


if __name__ == "__main__":
    main()
