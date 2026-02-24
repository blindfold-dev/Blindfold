"""Brazilian CNPJ (Cadastro Nacional de Pessoa Juridica) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["br"], entities=[EntityType.BR_CNPJ])


def _br_cnpj(matches):
    return [m for m in matches if m.entity_type == "Brazilian CNPJ"]


class TestValidBrCnpj:
    def test_valid_formatted(self, scanner):
        matches = _br_cnpj(scanner.detect("CNPJ: 11.222.333/0001-81"))
        assert len(matches) == 1
        assert matches[0].text == "11.222.333/0001-81"
        assert matches[0].score == 1.0

    def test_valid_compact(self, scanner):
        matches = _br_cnpj(scanner.detect("CNPJ: 11222333000181"))
        assert len(matches) == 1
        assert matches[0].text == "11222333000181"
        assert matches[0].score == 1.0


class TestInvalidBrCnpj:
    def test_invalid_checksum(self, scanner):
        assert _br_cnpj(scanner.detect("CNPJ: 11.222.333/0001-82")) == []

    def test_too_short(self, scanner):
        assert _br_cnpj(scanner.detect("CNPJ: 11.222.333/0001")) == []
