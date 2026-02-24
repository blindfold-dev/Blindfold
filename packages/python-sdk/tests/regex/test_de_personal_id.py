"""German Personal ID (Personalausweis) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["de"], entities=[EntityType.DE_PERSONAL_ID])


def _de_pid(matches):
    return [m for m in matches if m.entity_type == "German Personal ID"]


class TestValidDePersonalId:
    def test_valid_with_context(self, scanner):
        matches = _de_pid(scanner.detect("Personalausweis: T220001293"))
        assert len(matches) == 1
        assert matches[0].text == "T220001293"

    def test_valid_with_ausweis_context(self, scanner):
        matches = _de_pid(scanner.detect("Ausweis T220001293"))
        assert len(matches) == 1
        assert matches[0].text == "T220001293"


class TestInvalidDePersonalId:
    def test_no_match_without_context(self, scanner):
        assert _de_pid(scanner.detect("T220001293")) == []

    def test_invalid_format_all_digits(self, scanner):
        assert _de_pid(scanner.detect("Personalausweis: 1234567890")) == []

    def test_invalid_first_letter(self, scanner):
        assert _de_pid(scanner.detect("Personalausweis: A220001293")) == []
