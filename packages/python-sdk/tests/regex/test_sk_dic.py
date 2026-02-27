"""Slovak DIC (Tax Identification Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["sk"])


def _sk_dic(matches):
    return [m for m in matches if m.entity_type == "Slovak DIC"]


class TestValidSkDic:
    def test_valid_with_context(self, scanner):
        matches = _sk_dic(scanner.detect("DIC: SK2020317068"))
        assert len(matches) == 1
        assert matches[0].text == "SK2020317068"

    def test_valid_without_context(self, scanner):
        matches = _sk_dic(scanner.detect("SK2020317068"))
        assert len(matches) == 1


class TestInvalidSkDic:
    def test_invalid_no_context(self, scanner):
        assert _sk_dic(scanner.detect("SK2020317069")) == []
