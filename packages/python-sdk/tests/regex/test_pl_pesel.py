"""Polish PESEL detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["pl"], entities=[EntityType.PL_PESEL])


def _pl_pesel(matches):
    return [m for m in matches if m.entity_type == "Polish PESEL"]


class TestValidPlPesel:
    def test_valid_pesel(self, scanner):
        matches = _pl_pesel(scanner.detect("PESEL: 44051401359"))
        assert len(matches) == 1
        assert matches[0].text == "44051401359"
        assert matches[0].score == 1.0

    def test_valid_without_context(self, scanner):
        matches = _pl_pesel(scanner.detect("44051401359"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidPlPesel:
    def test_invalid_checksum(self, scanner):
        assert _pl_pesel(scanner.detect("PESEL: 44051401358")) == []

    def test_too_short(self, scanner):
        assert _pl_pesel(scanner.detect("PESEL: 4405140135")) == []
