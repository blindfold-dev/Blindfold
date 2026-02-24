"""French National ID (NIR / INSEE) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["fr"], entities=[EntityType.FR_NATIONAL_ID])


def _fr_nir(matches):
    return [m for m in matches if m.entity_type == "French National ID"]


class TestValidFrNationalId:
    def test_valid_with_spaces(self, scanner):
        matches = _fr_nir(scanner.detect("NIR: 1 85 05 78 006 084 91"))
        assert len(matches) == 1
        assert matches[0].text == "1 85 05 78 006 084 91"
        assert matches[0].score == 1.0

    def test_valid_compact(self, scanner):
        matches = _fr_nir(scanner.detect("NIR: 185057800608491"))
        assert len(matches) == 1
        assert matches[0].text == "185057800608491"
        assert matches[0].score == 1.0


class TestInvalidFrNationalId:
    def test_invalid_key(self, scanner):
        assert _fr_nir(scanner.detect("NIR: 185057800608499")) == []

    def test_invalid_month(self, scanner):
        assert _fr_nir(scanner.detect("NIR: 185137800608436")) == []
