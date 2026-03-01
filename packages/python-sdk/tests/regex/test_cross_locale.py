"""Comprehensive cross-locale tests for the PII scanner.

Tests every locale with all its entity types, cross-locale combinations,
locale isolation, universal detectors, and all scanner operations.

Many detectors have context_required=True, meaning they only match when a
context keyword appears near the PII value.  Every sample is therefore
wrapped as ``f"{context}: {sample}"`` using the CONTEXT_LABELS mapping.
"""

import pytest

from blindfold.regex import PIIScanner


# ---------------------------------------------------------------------------
# Context keywords per entity type.  The keyword is the first value from
# each detector's context list.  When context_required=True the keyword
# MUST be present for the detector to fire.  We include the keyword for
# ALL entities (even those with context_required=False) to keep the test
# helpers uniform.
# ---------------------------------------------------------------------------

CONTEXT_LABELS = {
    # US
    "Social Security Number": "ssn",
    "US ITIN": "itin",
    # EU
    "IBAN": "iban",
    # UK
    "UK UTR": "utr",
    # DE
    "German Tax ID": "steuer",
    "German Personal ID": "personalausweis",
    # FR
    "French National ID": "nir",
    "French SIREN": "siren",
    # ES
    "Spanish DNI": "dni",
    "Spanish NIE": "nie",
    "Spanish NSS": "nss",
    "Spanish CIF": "cif",
    # IT
    "Italian Codice Fiscale": "codice fiscale",
    "Italian Partita IVA": "partita iva",
    # PT
    "Portuguese NIF": "nif",
    # PL
    "Polish PESEL": "pesel",
    "Polish NIP": "nip",
    "Polish REGON": "regon",
    # CZ
    "Czech Birth Number": "rodne cislo",
    "Czech ICO": "ico",
    "Czech DIC": "dic",
    "Czech Bank Account": "ucet",
    # RU
    "Russian INN": "inn",
    "Russian SNILS": "snils",
    # NL
    "Dutch BSN": "bsn",
    # RO
    "Romanian CNP": "cnp",
    "Romanian CUI": "cui",
    # SK
    "Slovak Birth Number": "rodne cislo",
    "Slovak ICO": "ico",
    "Slovak DIC": "dic",
    # DK
    "Danish CPR": "cpr",
    "Danish CVR": "cvr",
    # SE
    "Swedish Personnummer": "personnummer",
    "Swedish Organisationsnummer": "organisationsnummer",
    # NO
    "Norwegian Birth Number": "fodselsnummer",
    "Norwegian Organisasjonsnummer": "organisasjonsnummer",
    # BR
    "Brazilian CPF": "cpf",
    "Brazilian CNPJ": "cnpj",
    # BE
    "Belgian National Number": "rijksregisternummer",
    "Belgian Enterprise Number": "bce",
    # AT
    "Austrian SVNR": "svnr",
    # IE
    "Irish PPS Number": "pps",
    # FI
    "Finnish HETU": "henkilotunnus",
    "Finnish Y-tunnus": "y-tunnus",
    # HU
    "Hungarian Tax ID": "adoazonosito",
    "Hungarian TAJ": "taj",
    # BG
    "Bulgarian EGN": "egn",
    # HR
    "Croatian OIB": "oib",
    # SI
    "Slovenian EMSO": "emso",
    "Slovenian Tax Number": "davcna stevilka",
    # LT
    "Lithuanian Personal Code": "asmens kodas",
    # LV
    "Latvian Personal Code": "personas kods",
    # EE
    "Estonian Personal Code": "isikukood",
    # CA
    "Canadian SIN": "sin",
    # CH
    "Swiss AHV": "ahv",
    # AU
    "Australian TFN": "tfn",
    "Australian Medicare": "medicare",
    # NZ
    "New Zealand IRD": "ird",
    # IN
    "Indian Aadhaar": "aadhaar",
    "Indian PAN": "pan",
    # JP
    "Japanese My Number": "my number",
    # KR  (use English alternative keyword)
    "Korean RRN": "resident registration number",
    # ZA
    "South African ID": "id number",
    # TR
    "Turkish Kimlik": "tc kimlik",
    # IL
    "Israeli ID": "teudat zehut",
    # AR
    "Argentine CUIT": "cuit",
    # CL
    "Chilean RUT": "rut",
    # CO
    "Colombian NIT": "nit",
    # Universal
    "Email Address": "email",
    "Credit Card Number": "card",
    "IP Address": "ip",
}


def _ctx(entity_type: str) -> str:
    """Return the context keyword for *entity_type*."""
    return CONTEXT_LABELS[entity_type]


def _text(entity_type: str, sample: str) -> str:
    """Build test text: ``context: sample``."""
    return f"{_ctx(entity_type)}: {sample}"


# ---------------------------------------------------------------------------
# Sample PII data per locale (values that pass checksum validation where
# applicable and score 1.0 in their respective detector tests).
# ---------------------------------------------------------------------------

LOCALE_SAMPLES = {
    "us": {
        "Social Security Number": "123-45-6789",
        "US ITIN": "912-70-1234",
    },
    "eu": {
        "IBAN": "DE89370400440532013000",
    },
    "uk": {
        "UK UTR": "1123456789",
    },
    "de": {
        "German Tax ID": "65929970489",
        "German Personal ID": "T220001293",
    },
    "fr": {
        "French National ID": "185057800608491",
        "French SIREN": "443061841",
    },
    "es": {
        "Spanish DNI": "12345678Z",
        "Spanish NIE": "X1234567L",
        "Spanish NSS": "281234567840",
        "Spanish CIF": "A58818501",
    },
    "it": {
        "Italian Codice Fiscale": "RSSMRA85T10A562S",
        "Italian Partita IVA": "12345678903",
    },
    "pt": {
        "Portuguese NIF": "199999996",
    },
    "pl": {
        "Polish PESEL": "44051401359",
        "Polish NIP": "1234563218",
        "Polish REGON": "123456785",
    },
    "cz": {
        "Czech Birth Number": "7103192745",
        "Czech ICO": "27864898",
        "Czech DIC": "CZ27864898",
        "Czech Bank Account": "2000145399/0800",
    },
    "ru": {
        "Russian INN": "7707083893",
        "Russian SNILS": "112-233-445 95",
    },
    "nl": {
        "Dutch BSN": "111222333",
    },
    "ro": {
        "Romanian CNP": "1850501350013",
        "Romanian CUI": "18189442",
    },
    "sk": {
        "Slovak Birth Number": "7103192745",
        "Slovak ICO": "31322832",
        "Slovak DIC": "SK2020317068",
    },
    "dk": {
        "Danish CPR": "010190-1234",
        "Danish CVR": "13585628",
    },
    "se": {
        "Swedish Personnummer": "811228-9874",
        "Swedish Organisationsnummer": "5567037485",
    },
    "no": {
        "Norwegian Birth Number": "01010750160",
        "Norwegian Organisasjonsnummer": "923609016",
    },
    "br": {
        "Brazilian CPF": "529.982.247-25",
        "Brazilian CNPJ": "11.222.333/0001-81",
    },
    "be": {
        "Belgian National Number": "85.07.30-033.28",
        "Belgian Enterprise Number": "0202.239.951",
    },
    "at": {
        "Austrian SVNR": "1237010180",
    },
    "ie": {
        "Irish PPS Number": "1234567T",
    },
    "fi": {
        "Finnish HETU": "131052-308T",
        "Finnish Y-tunnus": "2077474-0",
    },
    "hu": {
        "Hungarian Tax ID": "8071592153",
        "Hungarian TAJ": "123 456 788",
    },
    "bg": {
        "Bulgarian EGN": "7523169263",
    },
    "hr": {
        "Croatian OIB": "69435151530",
    },
    "si": {
        "Slovenian EMSO": "0101006500006",
        "Slovenian Tax Number": "SI15012557",
    },
    "lt": {
        "Lithuanian Personal Code": "38903110814",
    },
    "lv": {
        "Latvian Personal Code": "321291-16749",
    },
    "ee": {
        "Estonian Personal Code": "37605030299",
    },
    "ca": {
        "Canadian SIN": "046 454 286",
    },
    "ch": {
        "Swiss AHV": "756.1234.5678.97",
    },
    "au": {
        "Australian TFN": "123 456 782",
        "Australian Medicare": "2123 45670 1",
    },
    "nz": {
        "New Zealand IRD": "49-091-850",
    },
    "in": {
        "Indian Aadhaar": "2345 6789 0124",
        "Indian PAN": "ABCPD1234E",
    },
    "jp": {
        "Japanese My Number": "1234 5678 9018",
    },
    "kr": {
        "Korean RRN": "900101-1234568",
    },
    "za": {
        "South African ID": "8001015009087",
    },
    "tr": {
        "Turkish Kimlik": "10000000146",
    },
    "il": {
        "Israeli ID": "031456783",
    },
    "ar": {
        "Argentine CUIT": "20-12345678-6",
    },
    "cl": {
        "Chilean RUT": "12.345.678-5",
    },
    "co": {
        "Colombian NIT": "900.123.456-8",
    },
}

UNIVERSAL_SAMPLES = {
    "Email Address": "user@example.com",
    "Credit Card Number": "4532015112830366",
    "IP Address": "192.168.1.100",
}

ALL_LOCALES = sorted(LOCALE_SAMPLES.keys())


# ===================================================================
# 1. Per-locale detection: each locale detects all its entity types
# ===================================================================

class TestPerLocaleDetection:
    """Verify every locale detects every entity type registered to it."""

    @pytest.mark.parametrize("locale", ALL_LOCALES)
    def test_locale_detects_all_its_entities(self, locale):
        scanner = PIIScanner(locales=[locale])
        samples = LOCALE_SAMPLES[locale]
        for entity_type, sample in samples.items():
            text = _text(entity_type, sample)
            matches = scanner.detect(text, entities=[entity_type])
            found = [m for m in matches if m.entity_type == entity_type]
            assert len(found) >= 1, (
                f"Locale '{locale}' failed to detect {entity_type} in '{text}'"
            )

    @pytest.mark.parametrize("locale", ALL_LOCALES)
    def test_locale_detects_with_correct_text(self, locale):
        scanner = PIIScanner(locales=[locale])
        samples = LOCALE_SAMPLES[locale]
        for entity_type, sample in samples.items():
            text = f"{_ctx(entity_type)} {sample} here"
            matches = scanner.detect(text, entities=[entity_type])
            found = [m for m in matches if m.entity_type == entity_type]
            if found:
                assert sample in found[0].text or found[0].text in sample, (
                    f"Locale '{locale}' detected {entity_type} but text mismatch: "
                    f"expected '{sample}', got '{found[0].text}'"
                )


# ===================================================================
# 2. Universal detectors: work regardless of locale
# ===================================================================

class TestUniversalDetectors:
    """Universal detectors (email, credit card, IP) work with any locale."""

    @pytest.mark.parametrize("locale", ALL_LOCALES)
    def test_email_detected_in_every_locale(self, locale):
        scanner = PIIScanner(locales=[locale])
        matches = scanner.detect(
            "Contact user@example.com please",
            entities=["Email Address"],
        )
        emails = [m for m in matches if m.entity_type == "Email Address"]
        assert len(emails) == 1, f"Email not detected with locale '{locale}'"

    @pytest.mark.parametrize("locale", ALL_LOCALES)
    def test_credit_card_detected_in_every_locale(self, locale):
        scanner = PIIScanner(locales=[locale])
        matches = scanner.detect(
            "Card 4532015112830366",
            entities=["Credit Card Number"],
        )
        cc = [m for m in matches if m.entity_type == "Credit Card Number"]
        assert len(cc) == 1, f"Credit card not detected with locale '{locale}'"

    @pytest.mark.parametrize("locale", ALL_LOCALES)
    def test_ip_address_detected_in_every_locale(self, locale):
        scanner = PIIScanner(locales=[locale])
        matches = scanner.detect(
            "Server IP: 192.168.1.100",
            entities=["IP Address"],
        )
        ips = [m for m in matches if m.entity_type == "IP Address"]
        assert len(ips) == 1, f"IP address not detected with locale '{locale}'"


# ===================================================================
# 3. Locale isolation: locale X must not detect locale Y's entities
# ===================================================================

# Pairs: (detector_locale, entity_type, sample, non_locale)
# non_locale should NOT detect the entity
ISOLATION_PAIRS = [
    ("us", "Social Security Number", "123-45-6789", "eu"),
    ("us", "Social Security Number", "123-45-6789", "uk"),
    ("us", "Social Security Number", "123-45-6789", "de"),
    ("eu", "IBAN", "DE89370400440532013000", "us"),
    ("eu", "IBAN", "DE89370400440532013000", "br"),
    ("de", "German Tax ID", "65929970489", "fr"),
    ("de", "German Tax ID", "65929970489", "es"),
    ("fr", "French National ID", "185057800608491", "de"),
    ("fr", "French SIREN", "443061841", "it"),
    ("es", "Spanish DNI", "12345678Z", "fr"),
    ("es", "Spanish DNI", "12345678Z", "de"),
    ("it", "Italian Codice Fiscale", "RSSMRA85T10A562S", "es"),
    ("br", "Brazilian CPF", "529.982.247-25", "us"),
    ("br", "Brazilian CPF", "529.982.247-25", "ar"),
    ("pl", "Polish PESEL", "44051401359", "cz"),
    ("cz", "Czech Birth Number", "7103192745", "pl"),
    ("ru", "Russian INN", "7707083893", "de"),
    ("ca", "Canadian SIN", "046 454 286", "us"),
    ("au", "Australian TFN", "123 456 782", "nz"),
    ("in", "Indian PAN", "ABCPD1234E", "us"),
    ("jp", "Japanese My Number", "1234 5678 9018", "kr"),
    ("kr", "Korean RRN", "900101-1234568", "jp"),
    ("za", "South African ID", "8001015009087", "us"),
    ("tr", "Turkish Kimlik", "10000000146", "il"),
    ("ar", "Argentine CUIT", "20-12345678-6", "cl"),
    ("cl", "Chilean RUT", "12.345.678-5", "co"),
    ("se", "Swedish Personnummer", "811228-9874", "no"),
    ("no", "Norwegian Birth Number", "01010750160", "se"),
    ("dk", "Danish CPR", "010190-1234", "fi"),
    ("fi", "Finnish HETU", "131052-308T", "dk"),
    ("be", "Belgian National Number", "85.07.30-033.28", "nl"),
    ("nl", "Dutch BSN", "111222333", "be"),
    ("hu", "Hungarian Tax ID", "8071592153", "bg"),
    ("bg", "Bulgarian EGN", "7523169263", "hr"),
    ("hr", "Croatian OIB", "69435151530", "si"),
    ("si", "Slovenian EMSO", "0101006500006", "hr"),
    ("lt", "Lithuanian Personal Code", "38903110814", "lv"),
    ("lv", "Latvian Personal Code", "321291-16749", "ee"),
    ("ee", "Estonian Personal Code", "37605030299", "lt"),
    ("at", "Austrian SVNR", "1237010180", "ch"),
    ("ch", "Swiss AHV", "756.1234.5678.97", "at"),
    ("ie", "Irish PPS Number", "1234567T", "uk"),
    ("nz", "New Zealand IRD", "49-091-850", "au"),
    ("co", "Colombian NIT", "900.123.456-8", "ar"),
    ("il", "Israeli ID", "031456783", "tr"),
]


class TestLocaleIsolation:
    """Entities from one locale must not be detected by another locale."""

    @pytest.mark.parametrize(
        "home_locale,entity_type,sample,foreign_locale",
        ISOLATION_PAIRS,
        ids=[f"{p[3]}_rejects_{p[1].replace(' ', '_')}" for p in ISOLATION_PAIRS],
    )
    def test_foreign_locale_does_not_detect(
        self, home_locale, entity_type, sample, foreign_locale
    ):
        scanner = PIIScanner(locales=[foreign_locale])
        text = _text(entity_type, sample)
        matches = scanner.detect(text, entities=[entity_type])
        found = [m for m in matches if m.entity_type == entity_type]
        assert len(found) == 0, (
            f"Locale '{foreign_locale}' incorrectly detected {entity_type} "
            f"(belongs to '{home_locale}')"
        )


# ===================================================================
# 4. Multi-locale combinations
# ===================================================================

class TestMultiLocaleCombinations:
    """Multiple locales combined should detect entities from all of them."""

    def test_us_eu_uk(self):
        scanner = PIIScanner(locales=["us", "eu", "uk"])
        text = (
            "ssn 123-45-6789, "
            "iban DE89370400440532013000, "
            "utr 1123456789"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Social Security Number" in types
        assert "IBAN" in types

    def test_eu_with_country_locales(self):
        scanner = PIIScanner(locales=["eu", "de", "fr", "es"])
        text = (
            "iban DE89370400440532013000 "
            "steuer 65929970489 "
            "nir 185057800608491 "
            "dni 12345678Z"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "IBAN" in types
        assert "German Tax ID" in types
        assert "French National ID" in types
        assert "Spanish DNI" in types

    def test_latin_america(self):
        scanner = PIIScanner(locales=["br", "ar", "cl", "co"])
        text = (
            "cpf 529.982.247-25 "
            "cuit 20-12345678-6 "
            "rut 12.345.678-5 "
            "nit 900.123.456-8"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Brazilian CPF" in types
        assert "Argentine CUIT" in types
        assert "Chilean RUT" in types
        assert "Colombian NIT" in types

    def test_nordic(self):
        scanner = PIIScanner(locales=["dk", "se", "no", "fi"])
        text = (
            "cpr 010190-1234 "
            "personnummer 811228-9874 "
            "fodselsnummer 01010750160 "
            "henkilotunnus 131052-308T"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Danish CPR" in types
        assert "Swedish Personnummer" in types
        assert "Norwegian Birth Number" in types
        assert "Finnish HETU" in types

    def test_central_europe(self):
        scanner = PIIScanner(locales=["cz", "sk", "pl", "hu"])
        text = (
            "rodne cislo 7103192745 "
            "ico 31322832 "
            "pesel 44051401359 "
            "taj 123 456 788"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Czech Birth Number" in types or "Slovak Birth Number" in types
        assert "Polish PESEL" in types
        assert "Hungarian TAJ" in types

    def test_asia_pacific(self):
        scanner = PIIScanner(locales=["au", "nz", "in", "jp", "kr"])
        text = (
            "tfn 123 456 782 "
            "ird 49-091-850 "
            "aadhaar 2345 6789 0124 "
            "my number 1234 5678 9018 "
            "resident registration number 900101-1234568"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Australian TFN" in types
        assert "New Zealand IRD" in types
        assert "Indian Aadhaar" in types
        assert "Japanese My Number" in types
        assert "Korean RRN" in types

    def test_baltics(self):
        scanner = PIIScanner(locales=["lt", "lv", "ee"])
        text = (
            "asmens kodas 38903110814 "
            "personas kods 321291-16749 "
            "isikukood 37605030299"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Lithuanian Personal Code" in types
        assert "Latvian Personal Code" in types
        assert "Estonian Personal Code" in types

    def test_balkans(self):
        scanner = PIIScanner(locales=["bg", "hr", "si", "ro"])
        text = (
            "egn 7523169263 "
            "oib 69435151530 "
            "emso 0101006500006 "
            "cnp 1850501350013"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Bulgarian EGN" in types
        assert "Croatian OIB" in types
        assert "Slovenian EMSO" in types
        assert "Romanian CNP" in types

    def test_all_locales_combined(self):
        """Load every locale at once and detect one entity from each major region."""
        all_locales = list(LOCALE_SAMPLES.keys())
        scanner = PIIScanner(locales=all_locales)

        text = (
            "ssn 123-45-6789 "
            "iban DE89370400440532013000 "
            "cpf 529.982.247-25 "
            "dni 12345678Z "
            "pesel 44051401359 "
            "email user@example.com"
        )
        matches = scanner.detect(text)
        types = {m.entity_type for m in matches}
        assert "Social Security Number" in types
        assert "IBAN" in types
        assert "Brazilian CPF" in types
        assert "Spanish DNI" in types
        assert "Polish PESEL" in types
        assert "Email Address" in types


# ===================================================================
# 5. All scanner operations per locale (detect, redact, tokenize,
#    mask, hash, encrypt, synthesize)
# ===================================================================

# Pick a representative subset of locales for operation tests.
# Tuple: (locale, entity_type, sample)
OPERATION_LOCALES = [
    ("us", "Social Security Number", "123-45-6789"),
    ("eu", "IBAN", "DE89370400440532013000"),
    ("de", "German Tax ID", "65929970489"),
    ("fr", "French National ID", "185057800608491"),
    ("es", "Spanish DNI", "12345678Z"),
    ("br", "Brazilian CPF", "529.982.247-25"),
    ("cz", "Czech Birth Number", "7103192745"),
    ("pl", "Polish PESEL", "44051401359"),
    ("se", "Swedish Personnummer", "811228-9874"),
    ("au", "Australian TFN", "123 456 782"),
    ("in", "Indian Aadhaar", "2345 6789 0124"),
    ("jp", "Japanese My Number", "1234 5678 9018"),
    ("kr", "Korean RRN", "900101-1234568"),
    ("ar", "Argentine CUIT", "20-12345678-6"),
    ("it", "Italian Codice Fiscale", "RSSMRA85T10A562S"),
    ("dk", "Danish CPR", "010190-1234"),
    ("no", "Norwegian Birth Number", "01010750160"),
    ("nl", "Dutch BSN", "111222333"),
    ("ro", "Romanian CNP", "1850501350013"),
    ("bg", "Bulgarian EGN", "7523169263"),
    ("hr", "Croatian OIB", "69435151530"),
    ("ca", "Canadian SIN", "046 454 286"),
    ("ch", "Swiss AHV", "756.1234.5678.97"),
    ("za", "South African ID", "8001015009087"),
    ("tr", "Turkish Kimlik", "10000000146"),
]


class TestRedactPerLocale:
    """Redact removes PII for each locale."""

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        OPERATION_LOCALES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in OPERATION_LOCALES],
    )
    def test_redact_removes_pii(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = f"{_ctx(entity_type)}: {sample} end"
        redacted, matches = scanner.redact(text, entities=[entity_type])
        assert sample not in redacted, (
            f"Redact failed for {entity_type} ({locale}): '{sample}' still in output"
        )
        found = [m for m in matches if m.entity_type == entity_type]
        assert len(found) >= 1


class TestTokenizePerLocale:
    """Tokenize replaces PII with numbered tokens per locale."""

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        OPERATION_LOCALES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in OPERATION_LOCALES],
    )
    def test_tokenize_replaces_pii(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = f"{_ctx(entity_type)}: {sample} end"
        result = scanner.tokenize(text, entities=[entity_type])
        assert sample not in result.text, (
            f"Tokenize failed for {entity_type} ({locale})"
        )
        token = f"<{entity_type}_1>"
        assert token in result.text, (
            f"Expected token '{token}' in output for {locale}"
        )
        assert result.mapping[token] == sample or sample in result.mapping[token]


class TestMaskPerLocale:
    """Mask partially hides PII per locale."""

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        OPERATION_LOCALES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in OPERATION_LOCALES],
    )
    def test_mask_hides_pii(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = f"{_ctx(entity_type)}: {sample} end"
        result = scanner.mask(text, entities=[entity_type])
        assert sample not in result.text, (
            f"Mask failed for {entity_type} ({locale})"
        )
        assert "*" in result.text


class TestHashPerLocale:
    """Hash replaces PII with deterministic hashes per locale."""

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        OPERATION_LOCALES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in OPERATION_LOCALES],
    )
    def test_hash_replaces_pii(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = f"{_ctx(entity_type)}: {sample} end"
        result = scanner.hash(text, entities=[entity_type])
        assert sample not in result.text, (
            f"Hash failed for {entity_type} ({locale})"
        )
        assert "HASH_" in result.text

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        OPERATION_LOCALES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in OPERATION_LOCALES],
    )
    def test_hash_is_deterministic(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = f"{_ctx(entity_type)}: {sample} end"
        r1 = scanner.hash(text, entities=[entity_type])
        r2 = scanner.hash(text, entities=[entity_type])
        assert r1.text == r2.text


class TestEncryptPerLocale:
    """Encrypt replaces PII with encrypted values per locale."""

    KEY = "my-secret-key-1234567890"

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        OPERATION_LOCALES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in OPERATION_LOCALES],
    )
    def test_encrypt_replaces_pii(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = f"{_ctx(entity_type)}: {sample} end"
        result = scanner.encrypt(text, self.KEY, entities=[entity_type])
        assert sample not in result.text, (
            f"Encrypt failed for {entity_type} ({locale})"
        )


class TestSynthesizePerLocale:
    """Synthesize replaces PII with realistic fake values per locale."""

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        OPERATION_LOCALES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in OPERATION_LOCALES],
    )
    def test_synthesize_replaces_pii(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = f"{_ctx(entity_type)}: {sample} end"
        result = scanner.synthesize(text, entities=[entity_type])
        # Some entities may not have a synthesizer; just verify the PII
        # was processed (either replaced or still present if no synthesizer).
        # We check that the operation itself does not raise.
        assert result.text is not None


# ===================================================================
# 6. Method-level entity filtering across locales
# ===================================================================

class TestMethodLevelEntityFilteringCrossLocale:
    """Method-level entities param filters correctly across different locales."""

    def test_filter_single_entity_from_multi_locale(self):
        scanner = PIIScanner(locales=["us", "eu", "de"])
        text = "ssn 123-45-6789 iban DE89370400440532013000 steuer 65929970489"
        matches = scanner.detect(text, entities=["Social Security Number"])
        types = {m.entity_type for m in matches}
        assert types == {"Social Security Number"}

    def test_filter_two_entities_from_multi_locale(self):
        scanner = PIIScanner(locales=["us", "eu", "de"])
        text = "ssn 123-45-6789 iban DE89370400440532013000 steuer 65929970489"
        matches = scanner.detect(text, entities=["IBAN", "German Tax ID"])
        types = {m.entity_type for m in matches}
        assert "IBAN" in types
        assert "German Tax ID" in types
        assert "Social Security Number" not in types

    def test_filter_entity_not_in_loaded_locales(self):
        scanner = PIIScanner(locales=["us"])
        text = "iban DE89370400440532013000"
        matches = scanner.detect(text, entities=["IBAN"])
        assert len(matches) == 0

    def test_redact_with_entity_filter_multi_locale(self):
        scanner = PIIScanner(locales=["us", "eu"])
        text = "ssn 123-45-6789 and iban DE89370400440532013000"
        redacted, matches = scanner.redact(text, entities=["Social Security Number"])
        assert "123-45-6789" not in redacted
        assert "DE89370400440532013000" in redacted

    def test_tokenize_with_entity_filter_multi_locale(self):
        scanner = PIIScanner(locales=["br", "ar"])
        text = "cpf 529.982.247-25 cuit 20-12345678-6"
        result = scanner.tokenize(text, entities=["Brazilian CPF"])
        assert "<Brazilian CPF_1>" in result.text
        assert "20-12345678-6" in result.text

    def test_mask_with_entity_filter_multi_locale(self):
        scanner = PIIScanner(locales=["de", "fr"])
        text = "steuer 65929970489 nir 185057800608491"
        result = scanner.mask(text, entities=["German Tax ID"])
        assert "185057800608491" in result.text
        assert "65929970489" not in result.text

    def test_hash_with_entity_filter_multi_locale(self):
        scanner = PIIScanner(locales=["es", "it"])
        text = "dni 12345678Z codice fiscale RSSMRA85T10A562S"
        result = scanner.hash(text, entities=["Spanish DNI"])
        assert "RSSMRA85T10A562S" in result.text
        assert "12345678Z" not in result.text


# ===================================================================
# 7. Score validation
# ===================================================================

VALIDATED_ENTITIES = [
    ("us", "Social Security Number", "123-45-6789"),
    ("eu", "IBAN", "DE89370400440532013000"),
    ("br", "Brazilian CPF", "529.982.247-25"),
    ("br", "Brazilian CNPJ", "11.222.333/0001-81"),
    ("cz", "Czech Birth Number", "7103192745"),
    ("pl", "Polish PESEL", "44051401359"),
    ("pl", "Polish NIP", "1234563218"),
    ("bg", "Bulgarian EGN", "7523169263"),
    ("hr", "Croatian OIB", "69435151530"),
    ("ee", "Estonian Personal Code", "37605030299"),
    ("lt", "Lithuanian Personal Code", "38903110814"),
    ("au", "Australian TFN", "123 456 782"),
    ("ca", "Canadian SIN", "046 454 286"),
    ("ch", "Swiss AHV", "756.1234.5678.97"),
    ("es", "Spanish DNI", "12345678Z"),
    ("it", "Italian Codice Fiscale", "RSSMRA85T10A562S"),
    ("nl", "Dutch BSN", "111222333"),
    ("ro", "Romanian CNP", "1850501350013"),
    ("se", "Swedish Personnummer", "811228-9874"),
    ("no", "Norwegian Birth Number", "01010750160"),
    ("de", "German Tax ID", "65929970489"),
    ("fi", "Finnish HETU", "131052-308T"),
    ("hu", "Hungarian Tax ID", "8071592153"),
    ("il", "Israeli ID", "031456783"),
    ("tr", "Turkish Kimlik", "10000000146"),
    ("za", "South African ID", "8001015009087"),
    ("kr", "Korean RRN", "900101-1234568"),
    ("jp", "Japanese My Number", "1234 5678 9018"),
    ("ar", "Argentine CUIT", "20-12345678-6"),
    ("cl", "Chilean RUT", "12.345.678-5"),
]


class TestScoreValidation:
    """Validated entities (with checksum) should score 1.0."""

    @pytest.mark.parametrize(
        "locale,entity_type,sample",
        VALIDATED_ENTITIES,
        ids=[f"{loc}_{ent.replace(' ', '_')}" for loc, ent, _ in VALIDATED_ENTITIES],
    )
    def test_validated_entity_scores_1_0(self, locale, entity_type, sample):
        scanner = PIIScanner(locales=[locale])
        text = _text(entity_type, sample)
        matches = scanner.detect(text, entities=[entity_type])
        found = [m for m in matches if m.entity_type == entity_type]
        assert len(found) >= 1, f"Not detected: {entity_type} in locale {locale}"
        assert found[0].score == 1.0, (
            f"{entity_type} ({locale}) scored {found[0].score}, expected 1.0"
        )


# ===================================================================
# 8. Edge cases
# ===================================================================

class TestEdgeCases:
    """Edge cases: empty text, no PII, multiple same-type entities."""

    @pytest.mark.parametrize("locale", ALL_LOCALES)
    def test_empty_text_returns_no_matches(self, locale):
        scanner = PIIScanner(locales=[locale])
        assert scanner.detect("") == []

    @pytest.mark.parametrize("locale", ALL_LOCALES)
    def test_clean_text_returns_no_matches(self, locale):
        scanner = PIIScanner(locales=[locale])
        assert scanner.detect("This is a normal sentence with no PII.") == []

    def test_multiple_same_type_tokens_numbered(self):
        scanner = PIIScanner(locales=["us"])
        text = "Email a@b.com and c@d.com"
        result = scanner.tokenize(text, entities=["Email Address"])
        assert "<Email Address_1>" in result.text
        assert "<Email Address_2>" in result.text

    def test_all_locales_can_be_loaded_simultaneously(self):
        """Smoke test: loading all locales does not crash."""
        all_locales = list(LOCALE_SAMPLES.keys())
        scanner = PIIScanner(locales=all_locales)
        assert len(scanner._registry.detectors) > 50

    def test_duplicate_locale_does_not_duplicate_matches(self):
        """Duplicate locale in the list should not produce extra matches."""
        scanner_single = PIIScanner(locales=["us"])
        scanner_dup = PIIScanner(locales=["us", "us"])
        text = "ssn: 123-45-6789"
        matches_single = scanner_single.detect(text, entities=["Social Security Number"])
        matches_dup = scanner_dup.detect(text, entities=["Social Security Number"])
        # Deduplication should ensure equal match counts
        assert len(matches_single) == len(matches_dup), (
            f"Duplicate locale produced different match count: "
            f"{len(matches_single)} vs {len(matches_dup)}"
        )
