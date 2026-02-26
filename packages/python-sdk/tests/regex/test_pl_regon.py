"""Polish REGON detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["pl"], entities=[EntityType.PL_REGON])


def _pl_regon(matches):
    return [m for m in matches if m.entity_type == "Polish REGON"]


class TestValidPlRegon:
    def test_valid_with_context(self, scanner):
        matches = _pl_regon(scanner.detect("REGON: 123456785"))
        assert len(matches) == 1
        assert matches[0].text == "123456785"


class TestInvalidPlRegon:
    def test_invalid_checksum(self, scanner):
        assert _pl_regon(scanner.detect("REGON: 123456780")) == []
