"""Credit card detection tests with Luhn validation."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(entities=[EntityType.CREDIT_CARD])


def _cc(matches):
    return [m for m in matches if m.entity_type == "Credit Card Number"]


class TestValidCards:
    def test_valid_visa(self, scanner):
        matches = _cc(scanner.detect("Card: 4532015112830366"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_valid_mastercard(self, scanner):
        matches = _cc(scanner.detect("Card: 5425233430109903"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_valid_amex(self, scanner):
        matches = _cc(scanner.detect("Card: 378282246310005"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestCardSeparators:
    def test_visa_with_dashes(self, scanner):
        matches = _cc(scanner.detect("Card: 4532-0151-1283-0366"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_visa_with_spaces(self, scanner):
        matches = _cc(scanner.detect("Card: 4532 0151 1283 0366"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidCards:
    def test_invalid_luhn(self, scanner):
        matches = _cc(scanner.detect("Card: 4532015112830367"))
        assert len(matches) == 0

    def test_random_16_digits_fail_luhn(self, scanner):
        matches = _cc(scanner.detect("Card: 4111111111111112"))
        assert len(matches) == 0
