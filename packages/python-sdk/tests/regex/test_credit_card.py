"""Credit card detection tests with Luhn validation."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner()


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


class TestNewCardBrands:
    def test_mastercard_2series(self, scanner):
        # 2221-2720 range, Luhn-valid
        matches = _cc(scanner.detect("Card: 2221000000000009"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_mastercard_2series_with_dashes(self, scanner):
        matches = _cc(scanner.detect("Card: 2720-9900-0000-0007"))
        assert len(matches) == 1

    def test_diners_club(self, scanner):
        # 300-305 prefix, 14 digits, Luhn-valid
        matches = _cc(scanner.detect("Card: 30569309025904"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_diners_club_36(self, scanner):
        matches = _cc(scanner.detect("Card: 36700102000000"))
        assert len(matches) == 1

    def test_jcb(self, scanner):
        # 3528-3589 prefix, 16 digits, Luhn-valid
        matches = _cc(scanner.detect("Card: 3530111333300000"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_unionpay_16(self, scanner):
        # 62xx prefix, 16 digits, Luhn-valid
        matches = _cc(scanner.detect("Card: 6212345678901232"))
        assert len(matches) == 1

    def test_visa_13_digit(self, scanner):
        # 4xxx prefix, 13 digits, Luhn-valid
        matches = _cc(scanner.detect("Card: 4222222222222"))
        assert len(matches) == 1


class TestInvalidCards:
    def test_invalid_luhn(self, scanner):
        matches = _cc(scanner.detect("Card: 4532015112830367"))
        assert len(matches) == 0

    def test_random_16_digits_fail_luhn(self, scanner):
        matches = _cc(scanner.detect("Card: 4111111111111112"))
        assert len(matches) == 0
