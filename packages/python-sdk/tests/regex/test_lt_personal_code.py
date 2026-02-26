"""Lithuanian Personal Code detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["lt"], entities=[EntityType.LT_PERSONAL_CODE])


def _lt_pc(matches):
    return [m for m in matches if m.entity_type == "Lithuanian Personal Code"]


class TestValidLtPersonalCode:
    def test_valid_with_context(self, scanner):
        matches = _lt_pc(scanner.detect("Asmens kodas: 38903110814"))
        assert len(matches) == 1
        assert matches[0].text == "38903110814"


class TestInvalidLtPersonalCode:
    def test_invalid_checksum(self, scanner):
        assert _lt_pc(scanner.detect("Asmens kodas: 38903110817")) == []
