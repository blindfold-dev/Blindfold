"""Turkish Kimlik (National ID) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["tr"], entities=[EntityType.TR_KIMLIK])


def _tr_kimlik(matches):
    return [m for m in matches if m.entity_type == "Turkish Kimlik"]


class TestValidTrKimlik:
    def test_valid_with_context(self, scanner):
        matches = _tr_kimlik(scanner.detect("TC Kimlik: 10000000146"))
        assert len(matches) == 1
        assert matches[0].text == "10000000146"


class TestInvalidTrKimlik:
    def test_invalid_checksum(self, scanner):
        assert _tr_kimlik(scanner.detect("TC Kimlik: 10000000147")) == []
