"""Russian SNILS (Insurance Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ru"], entities=[EntityType.RU_SNILS])


def _ru_snils(matches):
    return [m for m in matches if m.entity_type == "Russian SNILS"]


class TestValidRuSnils:
    def test_valid_formatted(self, scanner):
        matches = _ru_snils(scanner.detect("SNILS: 112-233-445 95"))
        assert len(matches) == 1
        assert matches[0].text == "112-233-445 95"
        assert matches[0].score == 1.0

    def test_valid_compact(self, scanner):
        matches = _ru_snils(scanner.detect("SNILS: 11223344595"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidRuSnils:
    def test_invalid_checksum(self, scanner):
        assert _ru_snils(scanner.detect("SNILS: 112-233-445 99")) == []

    def test_no_match_without_context(self, scanner):
        assert _ru_snils(scanner.detect("112-233-445 95")) == []
