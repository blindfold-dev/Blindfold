"""Locale filtering tests for the PII scanner."""

import pytest

from blindfold.regex import PIIScanner


MIXED_TEXT = "SSN 123-45-6789 and IBAN DE89370400440532013000"


class TestUSOnlyLocale:
    def test_us_detects_ssn(self):
        scanner = PIIScanner(locales=["us"])
        ssn = [m for m in scanner.detect(MIXED_TEXT) if m.entity_type == "Social Security Number"]
        assert len(ssn) == 1

    def test_us_does_not_detect_iban(self):
        scanner = PIIScanner(locales=["us"])
        iban = [m for m in scanner.detect(MIXED_TEXT) if m.entity_type == "IBAN"]
        assert len(iban) == 0


class TestEUOnlyLocale:
    def test_eu_detects_iban(self):
        scanner = PIIScanner(locales=["eu"])
        iban = [m for m in scanner.detect(MIXED_TEXT) if m.entity_type == "IBAN"]
        assert len(iban) == 1

    def test_eu_does_not_detect_ssn(self):
        scanner = PIIScanner(locales=["eu"])
        ssn = [m for m in scanner.detect(MIXED_TEXT) if m.entity_type == "Social Security Number"]
        assert len(ssn) == 0


class TestCombinedLocales:
    def test_combined_detects_both(self):
        scanner = PIIScanner(locales=["us", "eu"])
        matches = scanner.detect(MIXED_TEXT)
        ssn = [m for m in matches if m.entity_type == "Social Security Number"]
        iban = [m for m in matches if m.entity_type == "IBAN"]
        assert len(ssn) == 1
        assert len(iban) == 1


class TestUKLocale:
    def test_uk_detects_ni_number(self):
        scanner = PIIScanner(locales=["uk"])
        matches = scanner.detect("NI number: AB 12 34 56 A")
        ni = [m for m in matches if m.entity_type == "NI Number"]
        assert len(ni) == 1

    def test_uk_does_not_detect_ssn(self):
        scanner = PIIScanner(locales=["uk"])
        ssn = [m for m in scanner.detect("SSN 123-45-6789") if m.entity_type == "Social Security Number"]
        assert len(ssn) == 0


class TestDELocale:
    def test_de_detects_tax_id(self):
        scanner = PIIScanner(locales=["de"])
        matches = scanner.detect("Steuer-ID: 65929970489")
        tax = [m for m in matches if m.entity_type == "German Tax ID"]
        assert len(tax) == 1

    def test_de_does_not_detect_ssn(self):
        scanner = PIIScanner(locales=["de"])
        ssn = [m for m in scanner.detect("SSN 123-45-6789") if m.entity_type == "Social Security Number"]
        assert len(ssn) == 0


class TestESLocale:
    def test_es_detects_dni(self):
        scanner = PIIScanner(locales=["es"])
        matches = scanner.detect("DNI: 12345678Z")
        dni = [m for m in matches if m.entity_type == "Spanish DNI"]
        assert len(dni) == 1

    def test_es_does_not_detect_iban(self):
        scanner = PIIScanner(locales=["es"])
        iban = [m for m in scanner.detect("IBAN DE89370400440532013000") if m.entity_type == "IBAN"]
        assert len(iban) == 0


class TestBRLocale:
    def test_br_detects_cpf(self):
        scanner = PIIScanner(locales=["br"])
        matches = scanner.detect("CPF: 529.982.247-25")
        cpf = [m for m in matches if m.entity_type == "Brazilian CPF"]
        assert len(cpf) == 1

    def test_br_does_not_detect_ssn(self):
        scanner = PIIScanner(locales=["br"])
        ssn = [m for m in scanner.detect("SSN 123-45-6789") if m.entity_type == "Social Security Number"]
        assert len(ssn) == 0


class TestLocaleIsolation:
    def test_de_does_not_detect_fr(self):
        scanner = PIIScanner(locales=["de"])
        matches = scanner.detect("NIR: 185057800608491")
        fr = [m for m in matches if m.entity_type == "French National ID"]
        assert len(fr) == 0

    def test_fr_does_not_detect_de(self):
        scanner = PIIScanner(locales=["fr"])
        matches = scanner.detect("Steuer-ID: 65929970489")
        de = [m for m in matches if m.entity_type == "German Tax ID"]
        assert len(de) == 0
