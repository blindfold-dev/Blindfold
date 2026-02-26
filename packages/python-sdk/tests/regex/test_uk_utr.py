"""UK UTR (Unique Taxpayer Reference) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["uk"], entities=[EntityType.UK_UTR])


def _uk_utr(matches):
    return [m for m in matches if m.entity_type == "UK UTR"]


class TestValidUkUtr:
    def test_valid_with_context(self, scanner):
        matches = _uk_utr(scanner.detect("UTR: 0955839661"))
        assert len(matches) == 1
        assert matches[0].text == "0955839661"


class TestInvalidUkUtr:
    def test_no_context(self, scanner):
        assert _uk_utr(scanner.detect("0955839661")) == []
