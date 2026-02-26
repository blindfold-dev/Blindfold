"""Finnish HETU (Personal Identity Code) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["fi"], entities=[EntityType.FI_HETU])


def _fi_hetu(matches):
    return [m for m in matches if m.entity_type == "Finnish HETU"]


class TestValidFiHetu:
    def test_valid_without_context(self, scanner):
        matches = _fi_hetu(scanner.detect("131052-308T"))
        assert len(matches) == 1
        assert matches[0].text == "131052-308T"


class TestInvalidFiHetu:
    def test_invalid_check_char(self, scanner):
        assert _fi_hetu(scanner.detect("131052-308A")) == []
