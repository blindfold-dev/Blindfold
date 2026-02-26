"""Belgian Enterprise Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["be"], entities=[EntityType.BE_ENTERPRISE_NUMBER])


def _be_ent(matches):
    return [m for m in matches if m.entity_type == "Belgian Enterprise Number"]


class TestValidBeEnterpriseNumber:
    def test_valid_with_context(self, scanner):
        matches = _be_ent(scanner.detect("BCE: 0202.239.951"))
        assert len(matches) == 1
        assert matches[0].text == "0202.239.951"


class TestInvalidBeEnterpriseNumber:
    def test_invalid_checksum(self, scanner):
        assert _be_ent(scanner.detect("BCE: 0202.239.952")) == []
