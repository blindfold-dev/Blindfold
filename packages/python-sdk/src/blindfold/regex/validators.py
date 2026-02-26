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


def us_itin_valid(number: str) -> bool:
    """Validate US ITIN format: 9XX-[7X|8X|9X]-XXXX."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 9:
        return False
    if digits[0] != "9":
        return False
    d4 = int(digits[3])
    return d4 >= 7


def uk_utr_checksum(number: str) -> bool:
    """Validate UK UTR using mod-11 weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 10:
        return False
    weights = [6, 7, 8, 9, 10, 5, 4, 3, 2]
    total = sum(digits[i + 1] * weights[i] for i in range(9))
    remainder = total % 11
    check = 0 if 11 - remainder >= 10 else 11 - remainder
    return digits[0] == check


def es_nss_checksum(number: str) -> bool:
    """Validate Spanish NSS using mod-97 checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 12:
        return False
    province = int(digits[:2])
    if province < 1 or province > 53:
        return False
    base_num = int(digits[:10])
    check = int(digits[10:12])
    return base_num % 97 == check


def es_cif_checksum(number: str) -> bool:
    """Validate Spanish CIF using custom checksum."""
    cleaned = "".join(c for c in number if c.isalnum()).upper()
    if len(cleaned) != 9:
        return False
    letter = cleaned[0]
    if letter not in "ABCDEFGHJNPQRSUVW":
        return False
    total_even = 0
    total_odd = 0
    for i in range(1, 8):
        d = int(cleaned[i]) if cleaned[i].isdigit() else -1
        if d < 0:
            return False
        if i % 2 == 0:
            total_even += d
        else:
            doubled = d * 2
            total_odd += doubled // 10 + doubled % 10
    total = total_even + total_odd
    check_digit = (10 - (total % 10)) % 10
    control = cleaned[8]
    if letter in "KPQS":
        return control == chr(ord("A") + check_digit)
    if letter in "ABEH":
        return control == str(check_digit)
    return control == str(check_digit) or control == chr(ord("A") + check_digit)


def it_partita_iva_checksum(number: str) -> bool:
    """Validate Italian Partita IVA using Luhn-like algorithm."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    if all(d == 0 for d in digits):
        return False
    total = 0
    for i in range(10):
        if i % 2 == 0:
            total += digits[i]
        else:
            doubled = digits[i] * 2
            total += doubled - 9 if doubled > 9 else doubled
    check = (10 - (total % 10)) % 10
    return digits[10] == check


def pl_regon_checksum(number: str) -> bool:
    """Validate Polish REGON using mod-11 weighted checksum (9 or 14 digits)."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) == 9:
        weights = [8, 9, 2, 3, 4, 5, 6, 7]
        total = sum(d * w for d, w in zip(digits[:8], weights))
        check = 0 if total % 11 == 10 else total % 11
        return digits[8] == check
    if len(digits) == 14:
        weights9 = [8, 9, 2, 3, 4, 5, 6, 7]
        total9 = sum(d * w for d, w in zip(digits[:8], weights9))
        check9 = 0 if total9 % 11 == 10 else total9 % 11
        if digits[8] != check9:
            return False
        weights14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8]
        total14 = sum(d * w for d, w in zip(digits[:13], weights14))
        check14 = 0 if total14 % 11 == 10 else total14 % 11
        return digits[13] == check14
    return False


def sk_ico_checksum(number: str) -> bool:
    """Validate Slovak ICO using same algorithm as Czech ICO."""
    return cz_ico_checksum(number)


def sk_dic_valid(number: str) -> bool:
    """Validate Slovak DIC: SK prefix + digits divisible by 11."""
    cleaned = number.strip()
    if cleaned.upper().startswith("SK"):
        cleaned = cleaned[2:]
    if not cleaned.isdigit() or len(cleaned) != 10:
        return False
    return int(cleaned) % 11 == 0


def ro_cui_checksum(number: str) -> bool:
    """Validate Romanian CUI using mod-11 weighted checksum."""
    cleaned = number.strip().upper()
    if cleaned.startswith("RO"):
        cleaned = cleaned[2:]
    digits = [int(c) for c in cleaned if c.isdigit()]
    if len(digits) < 2 or len(digits) > 10:
        return False
    weights = [7, 5, 3, 2, 1, 7, 5, 3, 2]
    padded = [0] * (10 - len(digits)) + digits
    check = padded.pop()
    total = sum(d * w for d, w in zip(padded, weights))
    expected = (total * 10) % 11
    if expected == 10:
        expected = 0
    return check == expected


def dk_cvr_checksum(number: str) -> bool:
    """Validate Danish CVR using mod-11 weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 8:
        return False
    weights = [2, 7, 6, 5, 4, 3, 2, 1]
    total = sum(d * w for d, w in zip(digits, weights))
    return total % 11 == 0


def se_orgnr_checksum(number: str) -> bool:
    """Validate Swedish Organisationsnummer using Luhn on 10 digits."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 10:
        return False
    if int(digits[2]) < 2:
        return False
    return luhn_checksum(digits)


def no_orgnr_checksum(number: str) -> bool:
    """Validate Norwegian Organisasjonsnummer using mod-11 weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 9:
        return False
    weights = [3, 2, 7, 6, 5, 4, 3, 2]
    total = sum(d * w for d, w in zip(digits[:8], weights))
    remainder = total % 11
    if remainder == 1:
        return False
    check = 0 if remainder == 0 else 11 - remainder
    return digits[8] == check


def be_national_number_checksum(number: str) -> bool:
    """Validate Belgian National Number using mod-97 checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 11:
        return False
    base = int(digits[:9])
    check = int(digits[9:11])
    if 97 - (base % 97) == check:
        return True
    base_2000 = int("2" + digits[:9])
    return 97 - (base_2000 % 97) == check


def be_enterprise_checksum(number: str) -> bool:
    """Validate Belgian Enterprise Number using mod-97 checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 10:
        return False
    if digits[0] not in ("0", "1"):
        return False
    base = int(digits[:8])
    check = int(digits[8:10])
    return 97 - (base % 97) == check


def at_svnr_checksum(number: str) -> bool:
    """Validate Austrian SVNR (Social Insurance Number)."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 10:
        return False
    weights = [3, 7, 9, 0, 5, 8, 4, 2, 1, 6]
    total = sum(d * w for d, w in zip(digits, weights))
    return total % 11 == digits[3]


def ie_pps_checksum(number: str) -> bool:
    """Validate Irish PPS Number using mod-23 checksum."""
    cleaned = "".join(c for c in number if c.isalnum()).upper()
    if len(cleaned) not in (8, 9):
        return False
    total = 0
    for i in range(7):
        if not cleaned[i].isdigit():
            return False
        total += int(cleaned[i]) * (8 - i)
    if len(cleaned) == 9 and cleaned[8].isalpha():
        total += (ord(cleaned[8]) - 64) * 9
    remainder = total % 23
    expected = "W" if remainder == 0 else chr(ord("A") + remainder - 1)
    return cleaned[7] == expected


def fi_hetu_checksum(number: str) -> bool:
    """Validate Finnish HETU using mod-31 checksum."""
    cleaned = number.replace(" ", "").replace("-", "")
    if len(cleaned) != 11:
        cleaned = number.strip()
    if len(cleaned) != 11:
        return False
    date_part = cleaned[:6]
    if not date_part.isdigit():
        return False
    sep = cleaned[6]
    if sep not in "-+ABCDEFYXWVU":
        return False
    num_part = cleaned[7:10]
    if not num_part.isdigit():
        return False
    check_chars = "0123456789ABCDEFHJKLMNPRSTUVWXY"
    combined = int(date_part + num_part)
    expected = check_chars[combined % 31]
    return cleaned[10].upper() == expected


def fi_ytunnus_checksum(number: str) -> bool:
    """Validate Finnish Y-tunnus (Business ID) using mod-11 weighted checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 8:
        return False
    weights = [7, 9, 10, 5, 8, 4, 2]
    total = sum(int(digits[i]) * weights[i] for i in range(7))
    remainder = total % 11
    if remainder == 1:
        return False
    check = 0 if remainder == 0 else 11 - remainder
    return int(digits[7]) == check


def hu_tax_id_checksum(number: str) -> bool:
    """Validate Hungarian Tax ID using mod-11 weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 10:
        return False
    if digits[0] != 8:
        return False
    weights = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    total = sum(d * w for d, w in zip(digits[:9], weights))
    return digits[9] == total % 11


def hu_taj_checksum(number: str) -> bool:
    """Validate Hungarian TAJ (Social Security) using mod-10 with 3/7 weights."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 9:
        return False
    total = sum(d * (3 if i % 2 == 0 else 7) for i, d in enumerate(digits[:8]))
    return digits[8] == total % 10


def bg_egn_checksum(number: str) -> bool:
    """Validate Bulgarian EGN using weighted mod-11 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 10:
        return False
    month = int(number[2:4]) if len(number) >= 4 else 0
    base_month = month - 40 if month > 40 else month - 20 if month > 20 else month
    if base_month < 1 or base_month > 12:
        return False
    weights = [2, 4, 8, 5, 10, 9, 7, 3, 6]
    total = sum(d * w for d, w in zip(digits[:9], weights))
    check = total % 11
    if check == 10:
        check = 0
    return digits[9] == check


def hr_oib_checksum(number: str) -> bool:
    """Validate Croatian OIB using ISO 7064 MOD 11,2."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    remainder = 10
    for i in range(10):
        remainder = (remainder + digits[i]) % 10
        if remainder == 0:
            remainder = 10
        remainder = (remainder * 2) % 11
    check = 11 - remainder
    if check == 10:
        check = 0
    return digits[10] == check


def si_emso_checksum(number: str) -> bool:
    """Validate Slovenian EMSO using mod-11 weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 13:
        return False
    weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    total = sum(d * w for d, w in zip(digits[:12], weights))
    remainder = total % 11
    check = 0 if remainder == 0 else 11 - remainder
    if check == 10:
        return False
    return digits[12] == check


def si_tax_number_checksum(number: str) -> bool:
    """Validate Slovenian Tax Number using mod-11."""
    cleaned = number.strip().upper()
    if cleaned.startswith("SI"):
        cleaned = cleaned[2:]
    digits = [int(c) for c in cleaned if c.isdigit()]
    if len(digits) != 8:
        return False
    weights = [8, 7, 6, 5, 4, 3, 2]
    total = sum(d * w for d, w in zip(digits[:7], weights))
    remainder = total % 11
    if remainder in (0, 1):
        return digits[7] == 0
    return digits[7] == 11 - remainder


def lt_personal_code_checksum(number: str) -> bool:
    """Validate Lithuanian Personal Code using dual-pass mod-11 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    if digits[0] < 1 or digits[0] > 6:
        return False
    weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1]
    total = sum(d * w for d, w in zip(digits[:10], weights1))
    check = total % 11
    if check == 10:
        weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        total = sum(d * w for d, w in zip(digits[:10], weights2))
        check = total % 11
        if check == 10:
            check = 0
    return digits[10] == check


def lv_personal_code_checksum(number: str) -> bool:
    """Validate Latvian Personal Code (old format with checksum)."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 11:
        return False
    day = int(digits[:2])
    month = int(digits[2:4])
    # New format starts with 32
    if digits[0] == "3" and digits[1] == "2":
        return True
    if day < 1 or day > 31:
        return False
    if month < 1 or month > 12:
        return False
    weights = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    total = sum(int(digits[i]) * weights[i] for i in range(10))
    check = ((1101 - total) % 11) % 10
    return int(digits[10]) == check


def ee_personal_code_checksum(number: str) -> bool:
    """Validate Estonian Personal Code using dual-pass mod-11 checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    if digits[0] < 1 or digits[0] > 6:
        return False
    weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1]
    total = sum(d * w for d, w in zip(digits[:10], weights1))
    check = total % 11
    if check == 10:
        weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        total = sum(d * w for d, w in zip(digits[:10], weights2))
        check = total % 11
        if check == 10:
            check = 0
    return digits[10] == check


def ch_ahv_checksum(number: str) -> bool:
    """Validate Swiss AHV using EAN-13 checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 13:
        return False
    if not digits.startswith("756"):
        return False
    total = sum(int(digits[i]) * (1 if i % 2 == 0 else 3) for i in range(12))
    check = (10 - (total % 10)) % 10
    return int(digits[12]) == check


def au_tfn_checksum(number: str) -> bool:
    """Validate Australian TFN using mod-11 weighted checksum."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) == 8:
        weights = [10, 7, 8, 4, 6, 3, 5, 1]
        total = sum(d * w for d, w in zip(digits, weights))
        return total % 11 == 0
    if len(digits) == 9:
        weights = [1, 4, 3, 7, 5, 8, 6, 9, 10]
        total = sum(d * w for d, w in zip(digits, weights))
        return total % 11 == 0
    return False


def au_medicare_checksum(number: str) -> bool:
    """Validate Australian Medicare number using mod-10 weighted checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) < 10 or len(digits) > 11:
        return False
    weights = [1, 3, 7, 9, 1, 3, 7, 9]
    total = sum(int(digits[i]) * weights[i] for i in range(8))
    return int(digits[8]) == total % 10


def nz_ird_checksum(number: str) -> bool:
    """Validate New Zealand IRD using dual-pass mod-11 checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) not in (8, 9):
        return False
    if len(digits) == 8:
        digits = "0" + digits
    d = [int(c) for c in digits]
    weights1 = [3, 2, 7, 6, 5, 4, 3, 2]
    total = sum(d[i] * weights1[i] for i in range(8))
    remainder = total % 11
    if remainder == 0:
        return d[8] == 0
    if 11 - remainder != 10:
        return d[8] == 11 - remainder
    weights2 = [7, 4, 3, 2, 5, 2, 7, 6]
    total = sum(d[i] * weights2[i] for i in range(8))
    r2 = total % 11
    if r2 == 0:
        return d[8] == 0
    return d[8] == 11 - r2


# Verhoeff lookup tables
_VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]
_VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]


def in_aadhaar_checksum(number: str) -> bool:
    """Validate Indian Aadhaar using Verhoeff algorithm."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 12:
        return False
    if digits[0] in ("0", "1"):
        return False
    c = 0
    for i in range(len(digits) - 1, -1, -1):
        c = _VERHOEFF_D[c][_VERHOEFF_P[(len(digits) - 1 - i) % 8][int(digits[i])]]
    return c == 0


def in_pan_valid(number: str) -> bool:
    """Validate Indian PAN format: AAAAA0000A."""
    import re
    cleaned = number.strip().upper()
    if len(cleaned) != 10:
        return False
    return bool(re.match(r"^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$", cleaned))


def jp_my_number_checksum(number: str) -> bool:
    """Validate Japanese My Number using mod-11 checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 12:
        return False
    total = 0
    for i in range(11):
        p = 11 - i
        q = p + 1 if p <= 6 else p - 5
        total += int(digits[i]) * q
    remainder = total % 11
    check = 0 if remainder <= 1 else 11 - remainder
    return int(digits[11]) == check


def kr_rrn_checksum(number: str) -> bool:
    """Validate Korean RRN using weighted mod checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 13:
        return False
    weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
    total = sum(int(digits[i]) * weights[i] for i in range(12))
    check = (11 - (total % 11)) % 10
    return int(digits[12]) == check


def tr_kimlik_checksum(number: str) -> bool:
    """Validate Turkish Kimlik using custom dual check digit algorithm."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) != 11:
        return False
    if digits[0] == 0:
        return False
    odd_sum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
    even_sum = digits[1] + digits[3] + digits[5] + digits[7]
    check1 = ((odd_sum * 7) - even_sum) % 10
    if check1 < 0:
        check1 += 10
    if check1 != digits[9]:
        return False
    total = sum(digits[:10])
    return total % 10 == digits[10]


def ar_cuit_checksum(number: str) -> bool:
    """Validate Argentine CUIT using mod-11 weighted checksum."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) != 11:
        return False
    weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    total = sum(int(digits[i]) * weights[i] for i in range(10))
    remainder = total % 11
    if remainder == 0:
        check = 0
    elif remainder == 1:
        check = 9
    else:
        check = 11 - remainder
    return int(digits[10]) == check


def cl_rut_checksum(number: str) -> bool:
    """Validate Chilean RUT using mod-11 checksum with K."""
    cleaned = number.replace(".", "").replace(" ", "").upper()
    if "-" in cleaned:
        parts = cleaned.split("-")
        if len(parts) != 2:
            return False
        cleaned = parts[0] + parts[1]
    if len(cleaned) < 2:
        return False
    body = cleaned[:-1]
    check_char = cleaned[-1]
    if not body.isdigit():
        return False
    total = 0
    mul = 2
    for c in reversed(body):
        total += int(c) * mul
        mul = 2 if mul == 7 else mul + 1
    remainder = 11 - (total % 11)
    if remainder == 11:
        expected = "0"
    elif remainder == 10:
        expected = "K"
    else:
        expected = str(remainder)
    return check_char == expected


def co_nit_checksum(number: str) -> bool:
    """Validate Colombian NIT using mod-11 with prime-based weights."""
    digits = "".join(c for c in number if c.isdigit())
    if len(digits) < 8 or len(digits) > 10:
        return False
    body = digits[:-1]
    check = int(digits[-1])
    weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
    total = sum(int(body[len(body) - 1 - i]) * weights[i] for i in range(len(body)))
    remainder = total % 11
    if remainder == 0:
        expected = 0
    elif remainder == 1:
        expected = 1
    else:
        expected = 11 - remainder
    return check == expected


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
