"""Portuguese NIF (Numero de Identificacao Fiscal) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["pt"])


def _pt_nif(matches):
    return [m for m in matches if m.entity_type == "Portuguese NIF"]


class TestValidPtNif:
    def test_valid_with_context(self, scanner):
        matches = _pt_nif(scanner.detect("NIF: 199999996"))
        assert len(matches) == 1
        assert matches[0].text == "199999996"
        assert matches[0].score == 1.0

    def test_valid_with_contribuinte_context(self, scanner):
        matches = _pt_nif(scanner.detect("Contribuinte: 199999996"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidPtNif:
    def test_invalid_checksum(self, scanner):
        assert _pt_nif(scanner.detect("NIF: 199999999")) == []

    def test_no_match_without_context(self, scanner):
        assert _pt_nif(scanner.detect("199999996")) == []

    def test_invalid_first_digit(self, scanner):
        assert _pt_nif(scanner.detect("NIF: 499999996")) == []
