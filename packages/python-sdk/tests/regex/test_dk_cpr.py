"""Danish CPR (Central Person Register) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["dk"])


def _dk_cpr(matches):
    return [m for m in matches if m.entity_type == "Danish CPR"]


class TestValidDkCpr:
    def test_valid_with_hyphen(self, scanner):
        matches = _dk_cpr(scanner.detect("CPR: 010190-1234"))
        assert len(matches) == 1
        assert matches[0].text == "010190-1234"
        assert matches[0].score == 1.0

    def test_valid_without_hyphen(self, scanner):
        matches = _dk_cpr(scanner.detect("CPR: 0101901234"))
        assert len(matches) == 1
        assert matches[0].text == "0101901234"
        assert matches[0].score == 1.0


class TestInvalidDkCpr:
    def test_invalid_day(self, scanner):
        assert _dk_cpr(scanner.detect("CPR: 320190-1234")) == []

    def test_no_match_without_context(self, scanner):
        assert _dk_cpr(scanner.detect("010190-1234")) == []

    def test_invalid_month(self, scanner):
        assert _dk_cpr(scanner.detect("CPR: 011390-1234")) == []
