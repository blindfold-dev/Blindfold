"""Slovenian EMSO (Unique Master Citizen Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["si"])


def _si_emso(matches):
    return [m for m in matches if m.entity_type == "Slovenian EMSO"]


class TestValidSiEmso:
    def test_valid_with_context(self, scanner):
        matches = _si_emso(scanner.detect("EMSO: 0101006500006"))
        assert len(matches) == 1
        assert matches[0].text == "0101006500006"


class TestInvalidSiEmso:
    def test_invalid_checksum(self, scanner):
        assert _si_emso(scanner.detect("EMSO: 0101006500007")) == []
