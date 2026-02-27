"""US Social Security Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us"])


def _ssn(matches):
    return [m for m in matches if m.entity_type == "Social Security Number"]


class TestValidSSN:
    def test_valid_ssn(self, scanner):
        matches = _ssn(scanner.detect("SSN: 123-45-6789"))
        assert len(matches) == 1
        assert matches[0].text == "123-45-6789"
        assert matches[0].score == 1.0


class TestInvalidSSN:
    def test_area_000(self, scanner):
        assert _ssn(scanner.detect("SSN: 000-12-3456")) == []

    def test_area_666(self, scanner):
        assert _ssn(scanner.detect("SSN: 666-12-3456")) == []

    def test_area_9xx(self, scanner):
        assert _ssn(scanner.detect("SSN: 900-12-3456")) == []
