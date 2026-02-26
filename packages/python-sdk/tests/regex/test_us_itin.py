"""US ITIN (Individual Taxpayer Identification Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us"], entities=[EntityType.US_ITIN])


def _us_itin(matches):
    return [m for m in matches if m.entity_type == "US ITIN"]


class TestValidUsItin:
    def test_valid_with_context(self, scanner):
        matches = _us_itin(scanner.detect("ITIN: 912-70-1234"))
        assert len(matches) == 1
        assert matches[0].text == "912-70-1234"


class TestInvalidUsItin:
    def test_not_9xx(self, scanner):
        assert _us_itin(scanner.detect("ITIN: 123-45-6789")) == []
