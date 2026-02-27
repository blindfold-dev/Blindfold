"""Korean RRN (Resident Registration Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["kr"])


def _kr_rrn(matches):
    return [m for m in matches if m.entity_type == "Korean RRN"]


class TestValidKrRrn:
    def test_valid_with_context(self, scanner):
        matches = _kr_rrn(scanner.detect("Resident registration: 900101-1234568"))
        assert len(matches) == 1
        assert matches[0].text == "900101-1234568"


class TestInvalidKrRrn:
    def test_invalid_checksum(self, scanner):
        assert _kr_rrn(scanner.detect("Resident registration: 900101-1234560")) == []
