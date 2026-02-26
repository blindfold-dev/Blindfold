"""Estonian Personal Code detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ee"], entities=[EntityType.EE_PERSONAL_CODE])


def _ee_pc(matches):
    return [m for m in matches if m.entity_type == "Estonian Personal Code"]


class TestValidEePersonalCode:
    def test_valid_with_context(self, scanner):
        matches = _ee_pc(scanner.detect("Isikukood: 37605030299"))
        assert len(matches) == 1
        assert matches[0].text == "37605030299"


class TestInvalidEePersonalCode:
    def test_invalid_checksum(self, scanner):
        assert _ee_pc(scanner.detect("Isikukood: 37605030290")) == []
