"""Austrian SVNR (Sozialversicherungsnummer) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["at"])


def _at_svnr(matches):
    return [m for m in matches if m.entity_type == "Austrian SVNR"]


class TestValidAtSvnr:
    def test_valid_with_context(self, scanner):
        matches = _at_svnr(scanner.detect("SVNR: 1237010180"))
        assert len(matches) == 1
        assert matches[0].text == "1237010180"


class TestInvalidAtSvnr:
    def test_invalid_checksum(self, scanner):
        assert _at_svnr(scanner.detect("SVNR: 1230010180")) == []
