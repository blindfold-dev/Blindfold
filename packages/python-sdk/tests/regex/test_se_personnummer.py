"""Swedish Personnummer detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["se"])


def _se_pn(matches):
    return [m for m in matches if m.entity_type == "Swedish Personnummer"]


class TestValidSePersonnummer:
    def test_valid_with_hyphen(self, scanner):
        matches = _se_pn(scanner.detect("Personnummer: 811228-9874"))
        assert len(matches) == 1
        assert matches[0].text == "811228-9874"
        assert matches[0].score == 1.0

    def test_valid_without_separator(self, scanner):
        matches = _se_pn(scanner.detect("8112289874"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidSePersonnummer:
    def test_invalid_luhn(self, scanner):
        assert _se_pn(scanner.detect("Personnummer: 811228-9875")) == []

    def test_invalid_month(self, scanner):
        assert _se_pn(scanner.detect("Personnummer: 811328-9874")) == []
