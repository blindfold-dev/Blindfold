"""Bulgarian EGN (Unified Civil Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["bg"])


def _bg_egn(matches):
    return [m for m in matches if m.entity_type == "Bulgarian EGN"]


class TestValidBgEgn:
    def test_valid_with_context(self, scanner):
        matches = _bg_egn(scanner.detect("EGN: 7523169263"))
        assert len(matches) == 1
        assert matches[0].text == "7523169263"


class TestInvalidBgEgn:
    def test_invalid_checksum(self, scanner):
        assert _bg_egn(scanner.detect("EGN: 7523169264")) == []
