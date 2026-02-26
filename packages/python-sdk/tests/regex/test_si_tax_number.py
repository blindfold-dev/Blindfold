"""Slovenian Tax Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["si"], entities=[EntityType.SI_TAX_NUMBER])


def _si_tax(matches):
    return [m for m in matches if m.entity_type == "Slovenian Tax Number"]


class TestValidSiTaxNumber:
    def test_valid_with_context(self, scanner):
        matches = _si_tax(scanner.detect("Davcna stevilka: SI15012557"))
        assert len(matches) == 1
        assert matches[0].text == "SI15012557"


class TestInvalidSiTaxNumber:
    def test_invalid_checksum(self, scanner):
        assert _si_tax(scanner.detect("Davcna stevilka: SI15012558")) == []
