"""Spanish DNI (Documento Nacional de Identidad) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["es"])


def _es_dni(matches):
    return [m for m in matches if m.entity_type == "Spanish DNI"]


class TestValidEsDni:
    def test_valid_dni(self, scanner):
        matches = _es_dni(scanner.detect("DNI: 12345678Z"))
        assert len(matches) == 1
        assert matches[0].text == "12345678Z"
        assert matches[0].score == 1.0

    def test_valid_with_separator(self, scanner):
        matches = _es_dni(scanner.detect("DNI: 12345678-Z"))
        assert len(matches) == 1
        assert matches[0].text == "12345678-Z"
        assert matches[0].score == 1.0


class TestInvalidEsDni:
    def test_invalid_letter(self, scanner):
        assert _es_dni(scanner.detect("DNI: 12345678A")) == []

    def test_too_few_digits(self, scanner):
        assert _es_dni(scanner.detect("DNI: 1234567Z")) == []
