"""Norwegian Organisasjonsnummer detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["no"])


def _no_orgnr(matches):
    return [m for m in matches if m.entity_type == "Norwegian Organisasjonsnummer"]


class TestValidNoOrgnr:
    def test_valid_with_context(self, scanner):
        matches = _no_orgnr(scanner.detect("Organisasjonsnummer: 923609016"))
        assert len(matches) == 1
        assert matches[0].text == "923609016"


class TestInvalidNoOrgnr:
    def test_invalid_checksum(self, scanner):
        assert _no_orgnr(scanner.detect("Organisasjonsnummer: 923609017")) == []
