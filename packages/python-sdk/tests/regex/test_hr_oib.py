"""Croatian OIB (Personal Identification Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["hr"], entities=[EntityType.HR_OIB])


def _hr_oib(matches):
    return [m for m in matches if m.entity_type == "Croatian OIB"]


class TestValidHrOib:
    def test_valid_with_context(self, scanner):
        matches = _hr_oib(scanner.detect("OIB: 69435151530"))
        assert len(matches) == 1
        assert matches[0].text == "69435151530"


class TestInvalidHrOib:
    def test_invalid_checksum(self, scanner):
        assert _hr_oib(scanner.detect("OIB: 69435151531")) == []
