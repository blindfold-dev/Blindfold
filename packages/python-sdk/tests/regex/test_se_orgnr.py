"""Swedish Organisationsnummer detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["se"])


def _se_orgnr(matches):
    return [m for m in matches if m.entity_type == "Swedish Organisationsnummer"]


class TestValidSeOrgnr:
    def test_valid_with_context(self, scanner):
        matches = _se_orgnr(scanner.detect("Organisationsnummer: 5567037485"))
        assert len(matches) == 1
        assert matches[0].text == "5567037485"


class TestInvalidSeOrgnr:
    def test_invalid_checksum(self, scanner):
        assert _se_orgnr(scanner.detect("Organisationsnummer: 5567037486")) == []
