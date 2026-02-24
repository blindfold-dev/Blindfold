"""Russian INN (Taxpayer Identification Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ru"], entities=[EntityType.RU_INN])


def _ru_inn(matches):
    return [m for m in matches if m.entity_type == "Russian INN"]


class TestValidRuInn:
    def test_valid_10_digit(self, scanner):
        matches = _ru_inn(scanner.detect("INN: 7707083893"))
        assert len(matches) == 1
        assert matches[0].text == "7707083893"
        assert matches[0].score == 1.0

    def test_valid_with_cyrillic_context(self, scanner):
        matches = _ru_inn(scanner.detect("\u0438\u043d\u043d: 7707083893"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidRuInn:
    def test_invalid_checksum(self, scanner):
        assert _ru_inn(scanner.detect("INN: 7707083890")) == []

    def test_no_match_without_context(self, scanner):
        assert _ru_inn(scanner.detect("7707083893")) == []
