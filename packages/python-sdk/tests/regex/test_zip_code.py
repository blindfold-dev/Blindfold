"""US ZIP Code detection tests."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us"])


def _zip(matches):
    return [m for m in matches if m.entity_type == "ZIP Code"]


class TestBasicFormats:
    def test_5_digit_zip(self, scanner):
        matches = _zip(scanner.detect("zip code: 90210"))
        assert len(matches) == 1

    def test_zip_plus_4(self, scanner):
        matches = _zip(scanner.detect("zip: 90210-1234"))
        assert len(matches) == 1


class TestExpandedContext:
    def test_address_keyword(self, scanner):
        matches = _zip(scanner.detect("address: 123 Main St, 90210"))
        assert len(matches) == 1

    def test_city_keyword(self, scanner):
        matches = _zip(scanner.detect("city: Beverly Hills, 90210"))
        assert len(matches) == 1

    def test_shipping_keyword(self, scanner):
        matches = _zip(scanner.detect("shipping to 90210"))
        assert len(matches) == 1

    def test_state_keyword(self, scanner):
        matches = _zip(scanner.detect("state: CA 90210"))
        assert len(matches) == 1


class TestValidator:
    def test_valid_zip(self, scanner):
        matches = _zip(scanner.detect("zip: 10001"))
        assert len(matches) == 1

    def test_invalid_000_prefix(self, scanner):
        matches = _zip(scanner.detect("zip: 00012"))
        assert len(matches) == 0


class TestNegatives:
    def test_no_context(self, scanner):
        matches = _zip(scanner.detect("The number is 90210"))
        assert len(matches) == 0

    def test_6_digits_not_zip(self, scanner):
        matches = _zip(scanner.detect("zip: 902101"))
        assert len(matches) == 0
