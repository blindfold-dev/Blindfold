"""Hungarian Tax ID detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["hu"], entities=[EntityType.HU_TAX_ID])


def _hu_tax(matches):
    return [m for m in matches if m.entity_type == "Hungarian Tax ID"]


class TestValidHuTaxId:
    def test_valid_with_context(self, scanner):
        matches = _hu_tax(scanner.detect("Tax ID: 8071592153"))
        assert len(matches) == 1
        assert matches[0].text == "8071592153"


class TestInvalidHuTaxId:
    def test_invalid_checksum(self, scanner):
        assert _hu_tax(scanner.detect("Tax ID: 8071592154")) == []
