"""Chilean RUT (Rol Unico Tributario) detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["cl"], entities=[EntityType.CL_RUT])


def _cl_rut(matches):
    return [m for m in matches if m.entity_type == "Chilean RUT"]


class TestValidClRut:
    def test_valid_with_context(self, scanner):
        matches = _cl_rut(scanner.detect("RUT: 12.345.678-5"))
        assert len(matches) == 1
        assert matches[0].text == "12.345.678-5"


class TestInvalidClRut:
    def test_invalid_checksum(self, scanner):
        assert _cl_rut(scanner.detect("RUT: 12.345.678-6")) == []
