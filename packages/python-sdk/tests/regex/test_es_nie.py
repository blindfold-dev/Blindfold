"""Spanish NIE (Numero de Identidad de Extranjero) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["es"])


def _es_nie(matches):
    return [m for m in matches if m.entity_type == "Spanish NIE"]


class TestValidEsNie:
    def test_valid_nie(self, scanner):
        matches = _es_nie(scanner.detect("NIE: X1234567L"))
        assert len(matches) == 1
        assert matches[0].text == "X1234567L"
        assert matches[0].score == 1.0

    def test_valid_y_prefix(self, scanner):
        # Y -> 1, so number is 11234567. 11234567 % 23 = 488459*23 = 11234557, remainder 10 -> 'X'
        matches = _es_nie(scanner.detect("NIE: Y1234567X"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidEsNie:
    def test_invalid_letter(self, scanner):
        assert _es_nie(scanner.detect("NIE: X1234567A")) == []

    def test_invalid_prefix(self, scanner):
        assert _es_nie(scanner.detect("NIE: A1234567L")) == []
