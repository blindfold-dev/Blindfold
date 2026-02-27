"""Belgian National Number detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["be"])


def _be_nn(matches):
    return [m for m in matches if m.entity_type == "Belgian National Number"]


class TestValidBeNationalNumber:
    def test_valid_with_context(self, scanner):
        matches = _be_nn(scanner.detect("National number: 85.07.30-033.28"))
        assert len(matches) == 1
        assert matches[0].text == "85.07.30-033.28"


class TestInvalidBeNationalNumber:
    def test_invalid_checksum(self, scanner):
        assert _be_nn(scanner.detect("National number: 85.07.30-033.29")) == []
