"""Australian Medicare Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["au"])


def _au_medicare(matches):
    return [m for m in matches if m.entity_type == "Australian Medicare"]


class TestValidAuMedicare:
    def test_valid_with_context(self, scanner):
        matches = _au_medicare(scanner.detect("Medicare: 2123 45670 1"))
        assert len(matches) == 1
        assert matches[0].text == "2123 45670 1"


class TestInvalidAuMedicare:
    def test_invalid_checksum(self, scanner):
        assert _au_medicare(scanner.detect("Medicare: 2123 45679 1")) == []
