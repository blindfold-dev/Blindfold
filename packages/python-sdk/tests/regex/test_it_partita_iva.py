"""Italian Partita IVA detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["it"], entities=[EntityType.IT_PARTITA_IVA])


def _it_piva(matches):
    return [m for m in matches if m.entity_type == "Italian Partita IVA"]


class TestValidItPartitaIva:
    def test_valid_with_context(self, scanner):
        matches = _it_piva(scanner.detect("Partita IVA: 12345678903"))
        assert len(matches) == 1
        assert matches[0].text == "12345678903"


class TestInvalidItPartitaIva:
    def test_invalid_checksum(self, scanner):
        assert _it_piva(scanner.detect("Partita IVA: 12345678900")) == []
