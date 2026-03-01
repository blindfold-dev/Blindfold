"""Phone number detection tests."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner()


def _phone(matches):
    return [m for m in matches if m.entity_type == "Phone Number"]


class TestNANP:
    def test_nanp_with_dashes(self, scanner):
        matches = _phone(scanner.detect("Call 555-867-5309"))
        assert len(matches) == 1

    def test_nanp_with_dots(self, scanner):
        matches = _phone(scanner.detect("Call 555.867.5309"))
        assert len(matches) == 1

    def test_nanp_with_parens(self, scanner):
        matches = _phone(scanner.detect("Call (555) 867-5309"))
        assert len(matches) == 1

    def test_nanp_parens_no_separator(self, scanner):
        matches = _phone(scanner.detect("Call (555)867-5309"))
        assert len(matches) == 1

    def test_nanp_parens_fully_compact(self, scanner):
        matches = _phone(scanner.detect("Call (555)8675309"))
        assert len(matches) == 1

    def test_nanp_plus1(self, scanner):
        matches = _phone(scanner.detect("Call +1 555-867-5309"))
        assert len(matches) == 1

    def test_nanp_plus1_no_space(self, scanner):
        matches = _phone(scanner.detect("Call +1555-867-5309"))
        assert len(matches) == 1


class TestInternational:
    def test_uk_with_separators(self, scanner):
        matches = _phone(scanner.detect("Call +44 7700 428594"))
        assert len(matches) == 1

    def test_uk_no_separator_after_cc(self, scanner):
        matches = _phone(scanner.detect("Call +447700428594"))
        assert len(matches) == 1

    def test_de_international(self, scanner):
        matches = _phone(scanner.detect("Call +49 30 12345678"))
        assert len(matches) == 1

    def test_fr_international(self, scanner):
        matches = _phone(scanner.detect("Call +33 1 23 45 67 89"))
        assert len(matches) == 1


class TestEUTrunkPrefix:
    def test_french_local(self, scanner):
        matches = _phone(scanner.detect("Call 02.37.15.52.25"))
        assert len(matches) == 1

    def test_belgian_local(self, scanner):
        matches = _phone(scanner.detect("Call 0488 71 46 12"))
        assert len(matches) == 1

    def test_dutch_local(self, scanner):
        matches = _phone(scanner.detect("Call 0650 241 46 10"))
        assert len(matches) == 1


class TestExtensions:
    def test_nanp_with_x_extension(self, scanner):
        matches = _phone(scanner.detect("Call (654)865-6539x373"))
        assert len(matches) == 1
        assert "x373" in matches[0].text

    def test_nanp_with_ext_extension(self, scanner):
        matches = _phone(scanner.detect("Call 555-867-5309 ext.456"))
        assert len(matches) == 1
        assert "ext.456" in matches[0].text


class TestNegatives:
    def test_short_number_not_phone(self, scanner):
        matches = _phone(scanner.detect("Reference: 12345"))
        assert len(matches) == 0

    def test_year_not_phone(self, scanner):
        matches = _phone(scanner.detect("The year 2024"))
        assert len(matches) == 0

    def test_price_not_phone(self, scanner):
        matches = _phone(scanner.detect("Total: $1,234.56"))
        assert len(matches) == 0
