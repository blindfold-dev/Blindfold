"""IBAN detection tests with mod-97 checksum validation."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["eu"])


def _iban(matches):
    return [m for m in matches if m.entity_type == "IBAN"]


class TestValidIBAN:
    def test_valid_german_iban(self, scanner):
        matches = _iban(scanner.detect("IBAN: DE89370400440532013000"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_valid_gb_iban(self, scanner):
        matches = _iban(scanner.detect("IBAN: GB29NWBK60161331926819"))
        assert len(matches) == 1
        assert matches[0].score == 1.0

    def test_iban_with_spaces(self, scanner):
        matches = _iban(scanner.detect("IBAN: DE89 3704 0044 0532 0130 00"))
        assert len(matches) == 1
        assert matches[0].score == 1.0


class TestInvalidIBAN:
    def test_invalid_checksum(self, scanner):
        assert _iban(scanner.detect("IBAN: DE00370400440532013000")) == []

    def test_invalid_checksum_gb(self, scanner):
        assert _iban(scanner.detect("IBAN: GB00NWBK60161331926819")) == []
