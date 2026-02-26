"""Hungarian TAJ (Social Security Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["hu"], entities=[EntityType.HU_TAJ])


def _hu_taj(matches):
    return [m for m in matches if m.entity_type == "Hungarian TAJ"]


class TestValidHuTaj:
    def test_valid_with_context(self, scanner):
        matches = _hu_taj(scanner.detect("TAJ: 123 456 788"))
        assert len(matches) == 1
        assert matches[0].text == "123 456 788"


class TestInvalidHuTaj:
    def test_invalid_checksum(self, scanner):
        assert _hu_taj(scanner.detect("TAJ: 123 456 789")) == []
