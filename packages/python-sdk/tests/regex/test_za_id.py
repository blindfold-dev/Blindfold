"""South African ID Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["za"])


def _za_id(matches):
    return [m for m in matches if m.entity_type == "South African ID"]


class TestValidZaId:
    def test_valid_with_context(self, scanner):
        matches = _za_id(scanner.detect("SA ID: 8001015009087"))
        assert len(matches) == 1
        assert matches[0].text == "8001015009087"


class TestInvalidZaId:
    def test_invalid_checksum(self, scanner):
        assert _za_id(scanner.detect("SA ID: 8001015009088")) == []
