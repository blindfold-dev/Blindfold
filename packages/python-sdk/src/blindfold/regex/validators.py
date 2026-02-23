"""Validation functions for PII entities (Luhn, IBAN mod-97, SSN, NHS)"""


def luhn_checksum(number: str) -> bool:
    """Validate a number string using the Luhn algorithm (ISO/IEC 7812)."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) < 2:
        return False
    total = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def iban_mod97(iban: str) -> bool:
    """Validate IBAN using ISO 7064 mod-97 checksum."""
    cleaned = iban.replace(" ", "").replace("-", "").upper()
    if len(cleaned) < 5 or not cleaned[:2].isalpha() or not cleaned[2:4].isdigit():
        return False
    # Move first 4 characters to end
    rearranged = cleaned[4:] + cleaned[:4]
    numeric = ""
    for c in rearranged:
        if c.isdigit():
            numeric += c
        elif c.isalpha():
            numeric += str(ord(c) - 55)
        else:
            return False
    try:
        return int(numeric) % 97 == 1
    except (ValueError, OverflowError):
        return False


def ssn_valid_format(ssn: str) -> bool:
    """Check SSN format rules: no 000/666/9xx area, no 00 group, no 0000 serial."""
    digits = "".join(c for c in ssn if c.isdigit())
    if len(digits) != 9:
        return False
    area = int(digits[:3])
    group = int(digits[3:5])
    serial = int(digits[5:])
    if area == 0 or area == 666 or area >= 900:
        return False
    if group == 0:
        return False
    if serial == 0:
        return False
    return True


def nhs_checksum(number: str) -> bool:
    """Validate NHS number using modulus 11 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 10:
        return False
    weights = [10, 9, 8, 7, 6, 5, 4, 3, 2]
    total = sum(d * w for d, w in zip(digits[:9], weights))
    remainder = total % 11
    check_digit = 11 - remainder
    if check_digit == 11:
        check_digit = 0
    if check_digit == 10:
        return False
    return digits[9] == check_digit
