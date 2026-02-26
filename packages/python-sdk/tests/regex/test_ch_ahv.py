"""Swiss AHV (Social Security Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ch"], entities=[EntityType.CH_AHV])


def _ch_ahv(matches):
    return [m for m in matches if m.entity_type == "Swiss AHV"]


class TestValidChAhv:
    def test_valid_without_context(self, scanner):
        matches = _ch_ahv(scanner.detect("756.1234.5678.97"))
        assert len(matches) == 1
        assert matches[0].text == "756.1234.5678.97"


class TestInvalidChAhv:
    def test_invalid_checksum(self, scanner):
        assert _ch_ahv(scanner.detect("756.1234.5678.96")) == []
