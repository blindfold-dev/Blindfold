"""Danish CVR (Central Business Register) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["dk"], entities=[EntityType.DK_CVR])


def _dk_cvr(matches):
    return [m for m in matches if m.entity_type == "Danish CVR"]


class TestValidDkCvr:
    def test_valid_with_context(self, scanner):
        matches = _dk_cvr(scanner.detect("CVR: 13585628"))
        assert len(matches) == 1
        assert matches[0].text == "13585628"


class TestInvalidDkCvr:
    def test_invalid_checksum(self, scanner):
        assert _dk_cvr(scanner.detect("CVR: 13585629")) == []
