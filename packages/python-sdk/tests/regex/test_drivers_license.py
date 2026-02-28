"""US Driver's License detection tests."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us"])


def _dl(matches):
    return [m for m in matches if m.entity_type == "Driver's License"]


class TestExistingFormats:
    def test_ca_format(self, scanner):
        matches = _dl(scanner.detect("driver's license: A1234567"))
        assert len(matches) == 1

    def test_ny_format(self, scanner):
        matches = _dl(scanner.detect("DL# 123456789"))
        assert len(matches) == 1

    def test_tx_format(self, scanner):
        matches = _dl(scanner.detect("license: 12345678"))
        assert len(matches) == 1

    def test_fl_format(self, scanner):
        matches = _dl(scanner.detect("DL A123456789012"))
        assert len(matches) == 1

    def test_il_format(self, scanner):
        matches = _dl(scanner.detect("license A12345678901"))
        assert len(matches) == 1


class TestNewFormats:
    def test_nj_format(self, scanner):
        matches = _dl(scanner.detect("driver's license: A12345678901234"))
        assert len(matches) == 1

    def test_wi_format(self, scanner):
        matches = _dl(scanner.detect("DL A1234567890123"))
        assert len(matches) == 1

    def test_mi_format(self, scanner):
        matches = _dl(scanner.detect("license: A1234567890"))
        assert len(matches) == 1

    def test_ma_va_format(self, scanner):
        matches = _dl(scanner.detect("DL# A12345678"))
        assert len(matches) == 1

    def test_oh_format(self, scanner):
        matches = _dl(scanner.detect("license: AB123456"))
        assert len(matches) == 1


class TestContextRequired:
    def test_no_context_no_match(self, scanner):
        matches = _dl(scanner.detect("Reference A1234567"))
        assert len(matches) == 0

    def test_dmv_keyword(self, scanner):
        matches = _dl(scanner.detect("DMV number: A1234567"))
        assert len(matches) == 1
