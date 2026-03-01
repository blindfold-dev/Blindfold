"""Finnish Y-tunnus (Business ID) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["fi"])


def _fi_ytunnus(matches):
    return [m for m in matches if m.entity_type == "Finnish Y-tunnus"]


class TestValidFiYtunnus:
    def test_valid_with_context(self, scanner):
        matches = _fi_ytunnus(scanner.detect("Y-tunnus: 2077474-0"))
        assert len(matches) == 1
        assert matches[0].text == "2077474-0"


class TestInvalidFiYtunnus:
    def test_invalid_checksum(self, scanner):
        assert _fi_ytunnus(scanner.detect("Y-tunnus: 2077474-1")) == []
