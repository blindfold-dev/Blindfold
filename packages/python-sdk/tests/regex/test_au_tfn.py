"""Australian TFN (Tax File Number) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["au"], entities=[EntityType.AU_TFN])


def _au_tfn(matches):
    return [m for m in matches if m.entity_type == "Australian TFN"]


class TestValidAuTfn:
    def test_valid_with_context(self, scanner):
        matches = _au_tfn(scanner.detect("TFN: 123 456 782"))
        assert len(matches) == 1
        assert matches[0].text == "123 456 782"


class TestInvalidAuTfn:
    def test_invalid_checksum(self, scanner):
        assert _au_tfn(scanner.detect("TFN: 123 456 783")) == []
