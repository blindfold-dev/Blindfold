"""Canadian SIN (Social Insurance Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["ca"], entities=[EntityType.CA_SIN])


def _ca_sin(matches):
    return [m for m in matches if m.entity_type == "Canadian SIN"]


class TestValidCaSin:
    def test_valid_with_context(self, scanner):
        matches = _ca_sin(scanner.detect("SIN: 046 454 286"))
        assert len(matches) == 1
        assert matches[0].text == "046 454 286"


class TestInvalidCaSin:
    def test_invalid_checksum(self, scanner):
        assert _ca_sin(scanner.detect("SIN: 046 454 287")) == []
