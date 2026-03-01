"""Czech ICO (Company ID) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["cz"])


def _cz_ico(matches):
    return [m for m in matches if m.entity_type == "Czech ICO"]


class TestValidCzIco:
    def test_valid_with_context(self, scanner):
        matches = _cz_ico(scanner.detect("ICO: 27864898"))
        assert len(matches) == 1
        assert matches[0].text == "27864898"
        assert matches[0].score == 1.0

    def test_valid_with_czech_keyword(self, scanner):
        matches = _cz_ico(scanner.detect("Identifikacni cislo: 25596641"))
        assert len(matches) == 1
        assert matches[0].text == "25596641"


class TestInvalidCzIco:
    def test_invalid_checksum(self, scanner):
        assert _cz_ico(scanner.detect("ICO: 27864899")) == []

    def test_no_match_without_context(self, scanner):
        assert _cz_ico(scanner.detect("27864898")) == []

    def test_wrong_length(self, scanner):
        assert _cz_ico(scanner.detect("ICO: 1234567")) == []
        assert _cz_ico(scanner.detect("ICO: 123456789")) == []
