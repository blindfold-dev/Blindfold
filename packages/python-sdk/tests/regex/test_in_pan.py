"""Indian PAN (Permanent Account Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["in"])


def _in_pan(matches):
    return [m for m in matches if m.entity_type == "Indian PAN"]


class TestValidInPan:
    def test_valid_with_context(self, scanner):
        matches = _in_pan(scanner.detect("PAN: ABCPD1234E"))
        assert len(matches) == 1
        assert matches[0].text == "ABCPD1234E"


class TestInvalidInPan:
    def test_invalid_fourth_char(self, scanner):
        assert _in_pan(scanner.detect("PAN: ABCZD1234E")) == []
