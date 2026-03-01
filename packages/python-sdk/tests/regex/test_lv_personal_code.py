"""Latvian Personal Code detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["lv"])


def _lv_pc(matches):
    return [m for m in matches if m.entity_type == "Latvian Personal Code"]


class TestValidLvPersonalCode:
    def test_valid_new_format(self, scanner):
        matches = _lv_pc(scanner.detect("Personas kods: 321291-16749"))
        assert len(matches) == 1
        assert matches[0].text == "321291-16749"


class TestInvalidLvPersonalCode:
    def test_invalid_checksum(self, scanner):
        assert _lv_pc(scanner.detect("Personas kods: 010191-11111")) == []
