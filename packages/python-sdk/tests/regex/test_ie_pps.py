"""Irish PPS (Personal Public Service) Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ie"], entities=[EntityType.IE_PPS])


def _ie_pps(matches):
    return [m for m in matches if m.entity_type == "Irish PPS Number"]


class TestValidIePps:
    def test_valid_with_context(self, scanner):
        matches = _ie_pps(scanner.detect("PPS: 1234567T"))
        assert len(matches) == 1
        assert matches[0].text == "1234567T"


class TestInvalidIePps:
    def test_invalid_check_letter(self, scanner):
        assert _ie_pps(scanner.detect("PPS: 1234567A")) == []
