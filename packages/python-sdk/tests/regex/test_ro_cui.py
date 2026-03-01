"""Romanian CUI (Cod Unic de Inregistrare) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ro"])


def _ro_cui(matches):
    return [m for m in matches if m.entity_type == "Romanian CUI"]


class TestValidRoCui:
    def test_valid_with_context(self, scanner):
        matches = _ro_cui(scanner.detect("CUI: 18189442"))
        assert len(matches) == 1
        assert matches[0].text == "18189442"


class TestInvalidRoCui:
    def test_invalid_checksum(self, scanner):
        assert _ro_cui(scanner.detect("CUI: 18189443")) == []
