"""Romanian CNP (Cod Numeric Personal) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ro"])


def _ro_cnp(matches):
    return [m for m in matches if m.entity_type == "Romanian CNP"]


class TestValidRoCnp:
    def test_valid_cnp(self, scanner):
        matches = _ro_cnp(scanner.detect("CNP: 1850501350013"))
        assert len(matches) == 1
        assert matches[0].text == "1850501350013"
        assert matches[0].score == 1.0

    def test_valid_without_context(self, scanner):
        matches = _ro_cnp(scanner.detect("1850501350013"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidRoCnp:
    def test_invalid_checksum(self, scanner):
        assert _ro_cnp(scanner.detect("CNP: 1850501350011")) == []

    def test_invalid_first_digit(self, scanner):
        assert _ro_cnp(scanner.detect("CNP: 9850501350013")) == []
