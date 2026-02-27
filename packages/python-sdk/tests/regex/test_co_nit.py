"""Colombian NIT (Tax Identification Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["co"])


def _co_nit(matches):
    return [m for m in matches if m.entity_type == "Colombian NIT"]


class TestValidCoNit:
    def test_valid_with_context(self, scanner):
        matches = _co_nit(scanner.detect("NIT: 900.123.456-8"))
        assert len(matches) == 1
        assert matches[0].text == "900.123.456-8"


class TestInvalidCoNit:
    def test_invalid_checksum(self, scanner):
        assert _co_nit(scanner.detect("NIT: 900.123.456-2")) == []
