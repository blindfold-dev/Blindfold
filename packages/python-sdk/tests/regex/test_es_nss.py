"""Spanish NSS (Numero de Seguridad Social) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["es"])


def _es_nss(matches):
    return [m for m in matches if m.entity_type == "Spanish NSS"]


class TestValidEsNss:
    def test_valid_with_context(self, scanner):
        matches = _es_nss(scanner.detect("NSS: 281234567840"))
        assert len(matches) == 1
        assert matches[0].text == "281234567840"


class TestInvalidEsNss:
    def test_invalid_checksum(self, scanner):
        assert _es_nss(scanner.detect("NSS: 281234567890")) == []
