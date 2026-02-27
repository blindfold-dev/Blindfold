"""Israeli ID Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["il"])


def _il_id(matches):
    return [m for m in matches if m.entity_type == "Israeli ID"]


class TestValidIlId:
    def test_valid_with_context(self, scanner):
        matches = _il_id(scanner.detect("Teudat Zehut: 031456783"))
        assert len(matches) == 1
        assert matches[0].text == "031456783"


class TestInvalidIlId:
    def test_invalid_checksum(self, scanner):
        assert _il_id(scanner.detect("Teudat Zehut: 031456784")) == []
