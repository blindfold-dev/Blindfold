"""Indian Aadhaar Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["in"])


def _in_aadhaar(matches):
    return [m for m in matches if m.entity_type == "Indian Aadhaar"]


class TestValidInAadhaar:
    def test_valid_with_context(self, scanner):
        matches = _in_aadhaar(scanner.detect("Aadhaar: 2345 6789 0124"))
        assert len(matches) == 1
        assert matches[0].text == "2345 6789 0124"


class TestInvalidInAadhaar:
    def test_starts_with_zero(self, scanner):
        assert _in_aadhaar(scanner.detect("Aadhaar: 0123 4567 8901")) == []
