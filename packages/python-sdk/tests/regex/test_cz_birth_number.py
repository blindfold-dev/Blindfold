"""Czech Birth Number (Rodne cislo) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["cz"])


def _cz_bn(matches):
    return [m for m in matches if m.entity_type == "Czech Birth Number"]


class TestValidCzBirthNumber:
    def test_valid_with_context(self, scanner):
        matches = _cz_bn(scanner.detect("Rodne cislo: 7103192745"))
        assert len(matches) == 1
        assert matches[0].text == "7103192745"
        assert matches[0].score == 1.0

    def test_valid_with_slash(self, scanner):
        matches = _cz_bn(scanner.detect("Rodne cislo: 710319/2745"))
        assert len(matches) == 1
        assert matches[0].text == "710319/2745"
        assert matches[0].score == 1.0


class TestInvalidCzBirthNumber:
    def test_not_divisible_by_11(self, scanner):
        assert _cz_bn(scanner.detect("Rodne cislo: 7103192746")) == []

    def test_no_match_without_context(self, scanner):
        assert _cz_bn(scanner.detect("7103192745")) == []

    def test_invalid_month(self, scanner):
        # 7113000004 is divisible by 11 but month 13 is invalid
        assert _cz_bn(scanner.detect("Rodne cislo: 7113000004")) == []
