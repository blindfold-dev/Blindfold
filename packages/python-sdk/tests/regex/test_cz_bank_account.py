"""Czech Bank Account Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["cz"])


def _cz_bank(matches):
    return [m for m in matches if m.entity_type == "Czech Bank Account"]


class TestValidCzBankAccount:
    def test_with_prefix(self, scanner):
        matches = _cz_bank(scanner.detect("Cislo uctu: 19-2000145399/0800"))
        assert len(matches) == 1
        assert matches[0].text == "19-2000145399/0800"

    def test_without_prefix(self, scanner):
        matches = _cz_bank(scanner.detect("Ucet: 2000145399/0800"))
        assert len(matches) == 1
        assert matches[0].text == "2000145399/0800"

    def test_no_context_needed(self, scanner):
        matches = _cz_bank(scanner.detect("19-2000145399/0800"))
        assert len(matches) == 1


class TestInvalidCzBankAccount:
    def test_invalid_account_checksum(self, scanner):
        assert _cz_bank(scanner.detect("Ucet: 2000145398/0800")) == []

    def test_invalid_bank_code_length(self, scanner):
        assert _cz_bank(scanner.detect("Ucet: 2000145399/08")) == []

    def test_birth_number_not_detected_as_bank_account(self, scanner):
        # 850101/0001 is a valid Czech birth number (Jan 1 1985, divisible by 11)
        assert _cz_bank(scanner.detect("850101/0001")) == []
        assert _cz_bank(scanner.detect("Ucet: 850101/0001")) == []
