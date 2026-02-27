"""German Tax ID (Steueridentifikationsnummer) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["de"])


def _de_tax(matches):
    return [m for m in matches if m.entity_type == "German Tax ID"]


class TestValidDeTaxId:
    def test_valid_with_spaces(self, scanner):
        matches = _de_tax(scanner.detect("Steuer-ID: 65 929 970 489"))
        assert len(matches) == 1
        assert matches[0].text == "65 929 970 489"
        assert matches[0].score == 1.0

    def test_valid_compact(self, scanner):
        matches = _de_tax(scanner.detect("Tax ID: 65929970489"))
        assert len(matches) == 1
        assert matches[0].text == "65929970489"
        assert matches[0].score == 1.0


class TestInvalidDeTaxId:
    def test_invalid_checksum(self, scanner):
        assert _de_tax(scanner.detect("Steuer-ID: 65929970488")) == []

    def test_too_short(self, scanner):
        assert _de_tax(scanner.detect("Steuer-ID: 6592997")) == []
