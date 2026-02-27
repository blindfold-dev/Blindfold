"""Slovak ICO (Identification Number of Organisation) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["sk"])


def _sk_ico(matches):
    return [m for m in matches if m.entity_type == "Slovak ICO"]


class TestValidSkIco:
    def test_valid_with_context(self, scanner):
        matches = _sk_ico(scanner.detect("ICO: 31322832"))
        assert len(matches) == 1
        assert matches[0].text == "31322832"


class TestInvalidSkIco:
    def test_invalid_checksum(self, scanner):
        assert _sk_ico(scanner.detect("ICO: 31322833")) == []
