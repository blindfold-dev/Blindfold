"""Norwegian Birth Number (Fodselsnummer) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["no"], entities=[EntityType.NO_BIRTH_NUMBER])


def _no_bn(matches):
    return [m for m in matches if m.entity_type == "Norwegian Birth Number"]


class TestValidNoBirthNumber:
    def test_valid_birth_number(self, scanner):
        matches = _no_bn(scanner.detect("Fodselsnummer: 01010750160"))
        assert len(matches) == 1
        assert matches[0].text == "01010750160"
        assert matches[0].score == 1.0

    def test_valid_without_context(self, scanner):
        matches = _no_bn(scanner.detect("01010750160"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidNoBirthNumber:
    def test_invalid_checksum(self, scanner):
        assert _no_bn(scanner.detect("Fodselsnummer: 01010750161")) == []

    def test_invalid_day(self, scanner):
        assert _no_bn(scanner.detect("Fodselsnummer: 32010750160")) == []
