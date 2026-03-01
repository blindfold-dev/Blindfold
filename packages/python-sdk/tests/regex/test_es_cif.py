"""Spanish CIF (Certificado de Identificacion Fiscal) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["es"])


def _es_cif(matches):
    return [m for m in matches if m.entity_type == "Spanish CIF"]


class TestValidEsCif:
    def test_valid_with_context(self, scanner):
        matches = _es_cif(scanner.detect("CIF: A58818501"))
        assert len(matches) == 1
        assert matches[0].text == "A58818501"

    def test_valid_without_context(self, scanner):
        matches = _es_cif(scanner.detect("A58818501"))
        assert len(matches) == 1


class TestInvalidEsCif:
    def test_invalid_checksum(self, scanner):
        assert _es_cif(scanner.detect("CIF: A58818502")) == []
