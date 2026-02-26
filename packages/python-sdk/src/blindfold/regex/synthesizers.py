"""Format-preserving PII synthesis: generates realistic fake replacements locally."""

import random
import string


def _rand_int(min_val: int, max_val: int) -> int:
    return random.randint(min_val, max_val)


def _rand_char(chars: str) -> str:
    return random.choice(chars)


def _rand_hex(length: int) -> str:
    return "".join(random.choice("0123456789abcdef") for _ in range(length))


def _format_preserving(original: str) -> str:
    """Replace digits with random digits, uppercase with random uppercase,
    lowercase with random lowercase, keep everything else intact."""
    chars = []
    for ch in original:
        if ch.isdigit():
            chars.append(_rand_char(string.digits))
        elif ch.isupper():
            chars.append(_rand_char(string.ascii_uppercase))
        elif ch.islower():
            chars.append(_rand_char(string.ascii_lowercase))
        else:
            chars.append(ch)
    result = "".join(chars)
    # Retry once if we accidentally generated the same value
    if result == original:
        return _format_preserving(original)
    return result


def _synthesize_email() -> str:
    return f"user{_rand_hex(8)}@example.com"


def _synthesize_url() -> str:
    return f"https://example.com/{_rand_hex(10)}"


def _synthesize_ip() -> str:
    a = _rand_int(1, 254)
    b = _rand_int(0, 255)
    c = _rand_int(0, 255)
    d = _rand_int(1, 254)
    return f"{a}.{b}.{c}.{d}"


def _synthesize_credit_card(original: str) -> str:
    """Generate a credit card number with valid Luhn checksum,
    preserving the separator pattern of the original."""
    digits_only = [ch for ch in original if ch.isdigit()]
    num_digits = len(digits_only)

    # Generate random digits (all but the last, which is the Luhn check digit)
    payload = [_rand_int(0, 9) for _ in range(num_digits - 1)]

    # Calculate Luhn check digit
    total = 0
    for i in range(len(payload) - 1, -1, -1):
        d = payload[i]
        if (len(payload) - 1 - i) % 2 == 0:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    check_digit = (10 - (total % 10)) % 10
    payload.append(check_digit)

    # Re-insert separators at the same positions as the original
    digit_idx = 0
    result = []
    for ch in original:
        if ch.isdigit():
            result.append(str(payload[digit_idx]))
            digit_idx += 1
        else:
            result.append(ch)
    return "".join(result)


def _synthesize_iban(original: str) -> str:
    """Generate an IBAN-like value preserving length with a valid mod-97 check."""
    stripped = original.replace(" ", "")
    length = len(stripped)
    if length < 5:
        return _format_preserving(original)

    # Generate random BBAN digits
    bban_len = length - 4
    bban = "".join(_rand_char(string.digits) for _ in range(bban_len))

    # Calculate check digits: convert "XX00" + bban to numeric for mod-97
    # Country letters: X=33, so "XX" -> "3333"
    numeric_str = bban + "333300"
    remainder = 0
    for ch in numeric_str:
        remainder = (remainder * 10 + int(ch)) % 97
    check_digits = str(98 - remainder).zfill(2)

    iban = "XX" + check_digits + bban

    # Re-insert spaces if original had them
    if " " in original:
        space_idx = 0
        result = []
        for ch in original:
            if ch == " ":
                result.append(" ")
            else:
                result.append(iban[space_idx] if space_idx < len(iban) else "0")
                space_idx += 1
        return "".join(result)

    return iban


def synthesize_value(entity_type: str, original_text: str) -> str:
    """Generate a synthetic replacement for a detected PII value.

    Uses format-preserving random by default, with specific generators
    for types where structural validity matters.
    """
    if entity_type == "Email Address":
        return _synthesize_email()
    elif entity_type == "URL":
        return _synthesize_url()
    elif entity_type == "IP Address":
        return _synthesize_ip()
    elif entity_type == "Credit Card Number":
        return _synthesize_credit_card(original_text)
    elif entity_type == "IBAN":
        return _synthesize_iban(original_text)
    else:
        return _format_preserving(original_text)
