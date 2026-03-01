"""New Zealand IRD (Inland Revenue Department) Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["nz"])


def _nz_ird(matches):
    return [m for m in matches if m.entity_type == "New Zealand IRD"]


class TestValidNzIrd:
    def test_valid_with_context(self, scanner):
        matches = _nz_ird(scanner.detect("IRD: 49-091-850"))
        assert len(matches) == 1
        assert matches[0].text == "49-091-850"


class TestInvalidNzIrd:
    def test_invalid_checksum(self, scanner):
        assert _nz_ird(scanner.detect("IRD: 49-091-851")) == []
