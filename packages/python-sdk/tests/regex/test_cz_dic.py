"""Czech DIC (Tax/VAT ID) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["cz"], entities=[EntityType.CZ_DIC])


def _cz_dic(matches):
    return [m for m in matches if m.entity_type == "Czech DIC"]


class TestValidCzDic:
    def test_valid_8_digit_company(self, scanner):
        matches = _cz_dic(scanner.detect("DIC: CZ27864898"))
        assert len(matches) == 1
        assert matches[0].text == "CZ27864898"

    def test_valid_10_digit_individual(self, scanner):
        matches = _cz_dic(scanner.detect("DIC: CZ7103192745"))
        assert len(matches) == 1
        assert matches[0].text == "CZ7103192745"

    def test_no_context_needed(self, scanner):
        matches = _cz_dic(scanner.detect("CZ27864898"))
        assert len(matches) == 1

    def test_case_insensitive(self, scanner):
        matches = _cz_dic(scanner.detect("cz27864898"))
        assert len(matches) == 1


class TestInvalidCzDic:
    def test_invalid_ico_checksum(self, scanner):
        assert _cz_dic(scanner.detect("CZ27864899")) == []

    def test_invalid_10_digit(self, scanner):
        assert _cz_dic(scanner.detect("CZ7103192746")) == []
