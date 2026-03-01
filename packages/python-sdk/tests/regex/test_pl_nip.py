"""Polish NIP (Tax Identification Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["pl"])


def _pl_nip(matches):
    return [m for m in matches if m.entity_type == "Polish NIP"]


class TestValidPlNip:
    def test_valid_with_context(self, scanner):
        matches = _pl_nip(scanner.detect("NIP: 1234563218"))
        assert len(matches) == 1
        assert matches[0].text == "1234563218"
        assert matches[0].score == 1.0

    def test_valid_with_separators(self, scanner):
        matches = _pl_nip(scanner.detect("NIP: 123-456-32-18"))
        assert len(matches) == 1
        assert matches[0].text == "123-456-32-18"
        assert matches[0].score == 1.0


class TestInvalidPlNip:
    def test_invalid_checksum(self, scanner):
        assert _pl_nip(scanner.detect("NIP: 1234563219")) == []

    def test_no_match_without_context(self, scanner):
        assert _pl_nip(scanner.detect("1234563218")) == []
