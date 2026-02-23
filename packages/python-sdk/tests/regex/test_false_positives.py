"""False positive tests -- inputs that must NOT be flagged as PII."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us", "eu", "uk"])


class TestVersionNumbers:
    def test_version_number_not_ip(self, scanner):
        ip = [m for m in scanner.detect("version 1.2.3.4") if m.entity_type == "IP Address"]
        assert len(ip) == 0

    def test_v_prefix_not_ip(self, scanner):
        ip = [m for m in scanner.detect("Running v1.2.3.4 of the app") if m.entity_type == "IP Address"]
        assert len(ip) == 0


class TestPlainNumbers:
    def test_year_not_pii(self, scanner):
        assert scanner.detect("The year 2024") == []

    def test_quantity_not_pii(self, scanner):
        assert scanner.detect("I have 100 apples") == []

    def test_time_not_pii(self, scanner):
        assert scanner.detect("My meeting is at 3:00") == []

    def test_order_number_not_zip(self, scanner):
        zips = [m for m in scanner.detect("Order #12345") if m.entity_type == "ZIP Code"]
        assert len(zips) == 0


class TestRegularSentences:
    def test_normal_sentence(self, scanner):
        assert scanner.detect("The quick brown fox jumps over the lazy dog.") == []

    def test_business_text(self, scanner):
        assert scanner.detect("Our quarterly revenue exceeded expectations this fiscal year.") == []
