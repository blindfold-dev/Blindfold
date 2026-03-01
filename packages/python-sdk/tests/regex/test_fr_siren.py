"""French SIREN detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["fr"])


def _fr_siren(matches):
    return [m for m in matches if m.entity_type == "French SIREN"]


class TestValidFrSiren:
    def test_valid_with_context(self, scanner):
        matches = _fr_siren(scanner.detect("SIREN: 443061841"))
        assert len(matches) == 1
        assert matches[0].text == "443061841"


class TestInvalidFrSiren:
    def test_invalid_checksum(self, scanner):
        assert _fr_siren(scanner.detect("SIREN: 443061842")) == []
