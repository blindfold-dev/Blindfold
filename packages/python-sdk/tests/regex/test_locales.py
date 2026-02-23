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
