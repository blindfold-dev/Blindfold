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


def de_tax_id_checksum(number: str) -> bool:
    """Validate German Tax ID (Steuerliche Identifikationsnummer) using ISO 7064 Mod 11,10."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    product = 10
    for i in range(10):
        total = (digits[i] + product) % 10
        if total == 0:
            total = 10
        product = (total * 2) % 11
    check = 11 - product
    if check == 10:
        check = 0
    return digits[10] == check


def fr_nir_checksum(number: str) -> bool:
    """Validate French NIR (National ID) using mod 97 checksum."""
    digits_str = "".join(c for c in number if c.isdigit() or c in "AaBb")
    # Handle Corsica departments: 2A -> 19, 2B -> 18
    cleaned = digits_str.upper().replace("2A", "19").replace("2B", "18")
    cleaned = "".join(c for c in cleaned if c.isdigit())
    if len(cleaned) != 15:
        return False
    base = int(cleaned[:13])
    key = int(cleaned[13:15])
    return key == (97 - (base % 97))


_ES_DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"


def es_dni_letter(number: str) -> bool:
    """Validate Spanish DNI check letter using mod-23 table."""
    cleaned = "".join(c for c in number if c.isdigit() or c.isalpha())
    if len(cleaned) != 9:
        return False
    digits_str = cleaned[:8]
    letter = cleaned[8].upper()
    if not digits_str.isdigit():
        return False
    expected = _ES_DNI_LETTERS[int(digits_str) % 23]
    return letter == expected


def es_nie_letter(number: str) -> bool:
    """Validate Spanish NIE check letter (X/Y/Z prefix, then same as DNI)."""
    cleaned = "".join(c for c in number if c.isdigit() or c.isalpha())
    if len(cleaned) != 9:
        return False
    prefix = cleaned[0].upper()
    mapping = {"X": "0", "Y": "1", "Z": "2"}
    if prefix not in mapping:
        return False
    digits_str = mapping[prefix] + cleaned[1:8]
    letter = cleaned[8].upper()
    if not digits_str.isdigit():
        return False
    expected = _ES_DNI_LETTERS[int(digits_str) % 23]
    return letter == expected


_IT_ODD_TABLE = {
    "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13, "6": 15, "7": 17, "8": 19, "9": 21,
    "A": 1, "B": 0, "C": 5, "D": 7, "E": 9, "F": 13, "G": 15, "H": 17, "I": 19, "J": 21,
    "K": 2, "L": 4, "M": 18, "N": 20, "O": 11, "P": 3, "Q": 6, "R": 8, "S": 12, "T": 14,
    "U": 16, "V": 10, "W": 22, "X": 25, "Y": 24, "Z": 23,
}

_IT_EVEN_TABLE = {
    "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
    "A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5, "G": 6, "H": 7, "I": 8, "J": 9,
    "K": 10, "L": 11, "M": 12, "N": 13, "O": 14, "P": 15, "Q": 16, "R": 17, "S": 18, "T": 19,
    "U": 20, "V": 21, "W": 22, "X": 23, "Y": 24, "Z": 25,
}


def it_codice_fiscale_check(code: str) -> bool:
    """Validate Italian Codice Fiscale using odd/even position lookup tables."""
    cleaned = "".join(c for c in code if c.isalnum()).upper()
    if len(cleaned) != 16:
        return False
    total = 0
    for i, c in enumerate(cleaned[:15]):
        if (i + 1) % 2 == 1:  # odd position (1-indexed)
            val = _IT_ODD_TABLE.get(c)
        else:
            val = _IT_EVEN_TABLE.get(c)
        if val is None:
            return False
        total += val
    expected = chr(total % 26 + ord("A"))
    return cleaned[15] == expected


def pt_nif_checksum(number: str) -> bool:
    """Validate Portuguese NIF using weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 9:
        return False
    # First digit must be 1-3 (personal) or 5,6,8,9 (business/other)
    if digits[0] not in (1, 2, 3, 5, 6, 8, 9):
        return False
    total = sum(d * w for d, w in zip(digits[:8], range(9, 1, -1)))
    remainder = total % 11
    check = 0 if remainder < 2 else 11 - remainder
    return digits[8] == check


def pl_pesel_checksum(number: str) -> bool:
    """Validate Polish PESEL using weighted mod-10 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    total = sum(d * w for d, w in zip(digits[:10], weights))
    check = (10 - (total % 10)) % 10
    return digits[10] == check


def pl_nip_checksum(number: str) -> bool:
    """Validate Polish NIP using weighted mod-11 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 10:
        return False
    weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
    total = sum(d * w for d, w in zip(digits[:9], weights))
    check = total % 11
    if check == 10:
        return False
    return digits[9] == check


def cz_birth_number_valid(number: str) -> bool:
    """Validate Czech Birth Number (Rodne cislo): divisible by 11 + month check."""
    cleaned = number.replace("/", "").replace(" ", "")
    if not cleaned.isdigit():
        return False
    if len(cleaned) not in (9, 10):
        return False
    # 10-digit numbers must be divisible by 11
    if len(cleaned) == 10 and int(cleaned) % 11 != 0:
        return False
    # Month check: valid months 01-12, +50 for females, +20 for post-2003
    month = int(cleaned[2:4])
    base_month = month % 50  # Remove female offset
    if base_month > 20:
        base_month -= 20  # Remove post-2003 offset
    if base_month < 1 or base_month > 12:
        return False
    return True


def cz_ico_checksum(number: str) -> bool:
    """Validate Czech ICO (Company ID) using mod-11 weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 8:
        return False
    weights = [8, 7, 6, 5, 4, 3, 2]
    total = sum(d * w for d, w in zip(digits[:7], weights))
    remainder = total % 11
    if remainder == 0:
        check = 1
    elif remainder == 1:
        check = 0
    else:
        check = 11 - remainder
    return digits[7] == check


def cz_dic_valid(number: str) -> bool:
    """Validate Czech DIC (Tax/VAT ID): CZ prefix + ICO or birth number checksum."""
    cleaned = number.strip()
    if cleaned.upper().startswith("CZ"):
        cleaned = cleaned[2:]
    if not cleaned.isdigit():
        return False
    if len(cleaned) == 8:
        return cz_ico_checksum(cleaned)
    if len(cleaned) == 10:
        return int(cleaned) % 11 == 0
    if len(cleaned) == 9:
        month = int(cleaned[2:4])
        base_month = month % 50
        if base_month > 20:
            base_month -= 20
        return 1 <= base_month <= 12
    return False


def cz_bank_account_valid(number: str) -> bool:
    """Validate Czech bank account number using mod-11 weighted checksum."""
    parts = number.split("/")
    if len(parts) != 2:
        return False
    bank_code = parts[1]
    if not bank_code.isdigit() or len(bank_code) != 4:
        return False
    account_part = parts[0]
    prefix = ""
    account = account_part
    if "-" in account_part:
        split = account_part.split("-")
        if len(split) != 2:
            return False
        prefix = split[0]
        account = split[1]
    if prefix and (not prefix.isdigit() or len(prefix) > 6):
        return False
    if not account.isdigit() or len(account) < 2 or len(account) > 10:
        return False
    weights = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1]
    # Validate account number
    acc_digits = [int(c) for c in account.zfill(10)]
    total = sum(d * w for d, w in zip(acc_digits, weights))
    if total % 11 != 0:
        return False
    # Validate prefix if present
    if prefix:
        pref_digits = [int(c) for c in prefix.zfill(6)]
        pref_weights = weights[4:]  # [10, 5, 8, 4, 2, 1]
        pref_total = sum(d * w for d, w in zip(pref_digits, pref_weights))
        if pref_total % 11 != 0:
            return False
    return True


def sk_birth_number_valid(number: str) -> bool:
    """Validate Slovak Birth Number (same logic as Czech)."""
    return cz_birth_number_valid(number)


def ru_inn_checksum(number: str) -> bool:
    """Validate Russian INN using weighted checksum (10 or 12 digits)."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) == 10:
        weights = [2, 4, 10, 3, 5, 9, 4, 6, 8]
        total = sum(d * w for d, w in zip(digits[:9], weights))
        return digits[9] == (total % 11) % 10
    elif len(digits) == 12:
        weights1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
        total1 = sum(d * w for d, w in zip(digits[:10], weights1))
        check1 = (total1 % 11) % 10
        if digits[10] != check1:
            return False
        weights2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
        total2 = sum(d * w for d, w in zip(digits[:11], weights2))
        check2 = (total2 % 11) % 10
        return digits[11] == check2
    return False


def ru_snils_checksum(number: str) -> bool:
    """Validate Russian SNILS using mod-101 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    # Numbers <= 001001998 are not validated by checksum
    base = int("".join(str(d) for d in digits[:9]))
    if base <= 1001998:
        return True
    total = sum(d * (9 - i) for i, d in enumerate(digits[:9]))
    check = total % 101
    if check == 100:
        check = 0
    check_value = digits[9] * 10 + digits[10]
    return check_value == check


def nl_bsn_11test(number: str) -> bool:
    """Validate Dutch BSN using the 11-test."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 9:
        return False
    # Weighted sum: 9*d1 + 8*d2 + ... + 2*d8 - 1*d9
    total = sum(d * w for d, w in zip(digits[:8], range(9, 1, -1))) - digits[8]
    return total % 11 == 0 and total != 0


def ro_cnp_checksum(number: str) -> bool:
    """Validate Romanian CNP using weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 13:
        return False
    # First digit: 1-8 (gender + century)
    if digits[0] < 1 or digits[0] > 8:
        return False
    weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
    total = sum(d * w for d, w in zip(digits[:12], weights))
    check = total % 11
    if check == 10:
        check = 1
    return digits[12] == check


def dk_cpr_valid_date(number: str) -> bool:
    """Validate Danish CPR number by checking the date portion."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 10:
        return False
    day = int(digits[0:2])
    month = int(digits[2:4])
    if day < 1 or day > 31:
        return False
    if month < 1 or month > 12:
        return False
    return True


def se_personnummer_luhn(number: str) -> bool:
    """Validate Swedish Personnummer using Luhn on the last 10 digits (YYMMDDXXXX)."""
    digits_str = "".join(c for c in number if c.isdigit())
    # Accept 10 or 12 digit forms
    if len(digits_str) == 12:
        digits_str = digits_str[2:]  # Drop century digits
    if len(digits_str) != 10:
        return False
    # Basic date validation
    month = int(digits_str[2:4])
    day = int(digits_str[4:6])
    if month < 1 or month > 12:
        return False
    if day < 1 or day > 31:
        return False
    return luhn_checksum(digits_str)


def no_birth_number_checksum(number: str) -> bool:
    """Validate Norwegian Birth Number using dual weighted checksums."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    # Control digit 1
    weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2]
    total1 = sum(d * w for d, w in zip(digits[:9], weights1))
    check1 = 11 - (total1 % 11)
    if check1 == 11:
        check1 = 0
    if check1 == 10:
        return False
    if digits[9] != check1:
        return False
    # Control digit 2
    weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    total2 = sum(d * w for d, w in zip(digits[:10], weights2))
    check2 = 11 - (total2 % 11)
    if check2 == 11:
        check2 = 0
    if check2 == 10:
        return False
    return digits[10] == check2


def br_cpf_checksum(number: str) -> bool:
    """Validate Brazilian CPF using weighted mod-11 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    # Reject known invalid sequences (all same digits)
    if len(set(digits)) == 1:
        return False
    # First check digit
    total1 = sum(d * w for d, w in zip(digits[:9], range(10, 1, -1)))
    check1 = (total1 * 10) % 11
    if check1 == 10:
        check1 = 0
    if digits[9] != check1:
        return False
    # Second check digit
    total2 = sum(d * w for d, w in zip(digits[:10], range(11, 1, -1)))
    check2 = (total2 * 10) % 11
    if check2 == 10:
        check2 = 0
    return digits[10] == check2


def br_cnpj_checksum(number: str) -> bool:
    """Validate Brazilian CNPJ using weighted mod-11 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 14:
        return False
    # First check digit
    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    total1 = sum(d * w for d, w in zip(digits[:12], weights1))
    check1 = total1 % 11
    check1 = 0 if check1 < 2 else 11 - check1
    if digits[12] != check1:
        return False
    # Second check digit
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    total2 = sum(d * w for d, w in zip(digits[:13], weights2))
    check2 = total2 % 11
    check2 = 0 if check2 < 2 else 11 - check2
    return digits[13] == check2


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
