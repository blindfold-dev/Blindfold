"""Brazilian CPF (Cadastro de Pessoa Fisica) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["br"])


def _br_cpf(matches):
    return [m for m in matches if m.entity_type == "Brazilian CPF"]


class TestValidBrCpf:
    def test_valid_formatted(self, scanner):
        matches = _br_cpf(scanner.detect("CPF: 529.982.247-25"))
        assert len(matches) == 1
        assert matches[0].text == "529.982.247-25"
        assert matches[0].score == 1.0

    def test_valid_compact(self, scanner):
        matches = _br_cpf(scanner.detect("CPF: 52998224725"))
        assert len(matches) == 1
        assert matches[0].text == "52998224725"
        assert matches[0].score == 1.0


class TestInvalidBrCpf:
    def test_invalid_checksum(self, scanner):
        assert _br_cpf(scanner.detect("CPF: 529.982.247-26")) == []

    def test_all_same_digits(self, scanner):
        assert _br_cpf(scanner.detect("CPF: 111.111.111-11")) == []
