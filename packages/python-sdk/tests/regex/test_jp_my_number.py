"""Japanese My Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["jp"], entities=[EntityType.JP_MY_NUMBER])


def _jp_mn(matches):
    return [m for m in matches if m.entity_type == "Japanese My Number"]


class TestValidJpMyNumber:
    def test_valid_with_context(self, scanner):
        matches = _jp_mn(scanner.detect("My Number: 1234 5678 9018"))
        assert len(matches) == 1
        assert matches[0].text == "1234 5678 9018"


class TestInvalidJpMyNumber:
    def test_invalid_checksum(self, scanner):
        assert _jp_mn(scanner.detect("My Number: 1234 5678 9013")) == []
