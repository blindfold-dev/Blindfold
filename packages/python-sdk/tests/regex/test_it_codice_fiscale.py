"""Italian Codice Fiscale detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["it"], entities=[EntityType.IT_CODICE_FISCALE])


def _it_cf(matches):
    return [m for m in matches if m.entity_type == "Italian Codice Fiscale"]


class TestValidItCodiceFiscale:
    def test_valid_codice_fiscale(self, scanner):
        matches = _it_cf(scanner.detect("Codice Fiscale: RSSMRA85T10A562S"))
        assert len(matches) == 1
        assert matches[0].text == "RSSMRA85T10A562S"
        assert matches[0].score == 1.0

    def test_valid_without_context(self, scanner):
        matches = _it_cf(scanner.detect("RSSMRA85T10A562S"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidItCodiceFiscale:
    def test_invalid_check_letter(self, scanner):
        assert _it_cf(scanner.detect("Codice Fiscale: RSSMRA85T10A562A")) == []

    def test_too_short(self, scanner):
        assert _it_cf(scanner.detect("Codice Fiscale: RSSMRA85T10A56")) == []
