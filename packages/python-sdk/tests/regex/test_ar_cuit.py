"""Argentine CUIT (Tax Identification) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ar"])


def _ar_cuit(matches):
    return [m for m in matches if m.entity_type == "Argentine CUIT"]


class TestValidArCuit:
    def test_valid_with_context(self, scanner):
        matches = _ar_cuit(scanner.detect("CUIT: 20-12345678-6"))
        assert len(matches) == 1
        assert matches[0].text == "20-12345678-6"


class TestInvalidArCuit:
    def test_invalid_checksum(self, scanner):
        assert _ar_cuit(scanner.detect("CUIT: 20-12345678-4")) == []
