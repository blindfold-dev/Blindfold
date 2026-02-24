"""Dutch BSN (Burgerservicenummer) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["nl"], entities=[EntityType.NL_BSN])


def _nl_bsn(matches):
    return [m for m in matches if m.entity_type == "Dutch BSN"]


class TestValidNlBsn:
    def test_valid_with_context(self, scanner):
        matches = _nl_bsn(scanner.detect("BSN: 111222333"))
        assert len(matches) == 1
        assert matches[0].text == "111222333"
        assert matches[0].score == 1.0

    def test_valid_with_burgerservicenummer_context(self, scanner):
        matches = _nl_bsn(scanner.detect("Burgerservicenummer: 111222333"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidNlBsn:
    def test_invalid_checksum(self, scanner):
        assert _nl_bsn(scanner.detect("BSN: 111222334")) == []

    def test_no_match_without_context(self, scanner):
        assert _nl_bsn(scanner.detect("111222333")) == []
