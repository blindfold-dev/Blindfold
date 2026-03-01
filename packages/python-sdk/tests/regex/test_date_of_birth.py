"""Date of birth detection tests."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner()


def _dob(matches):
    return [m for m in matches if m.entity_type == "Date of Birth"]


class TestMMDDYYYY:
    def test_slash_separator(self, scanner):
        matches = _dob(scanner.detect("born on 03/15/1990"))
        assert len(matches) == 1

    def test_dash_separator(self, scanner):
        matches = _dob(scanner.detect("dob: 03-15-1990"))
        assert len(matches) == 1

    def test_dot_separator(self, scanner):
        matches = _dob(scanner.detect("birthday 03.15.1990"))
        assert len(matches) == 1

    def test_single_digit_month_day(self, scanner):
        matches = _dob(scanner.detect("born 3/5/1990"))
        assert len(matches) == 1


class TestMMDDYY:
    def test_two_digit_year(self, scanner):
        matches = _dob(scanner.detect("dob: 03/15/90"))
        assert len(matches) == 1

    def test_two_digit_year_dash(self, scanner):
        matches = _dob(scanner.detect("born on 12-25-85"))
        assert len(matches) == 1


class TestISO:
    def test_iso_format(self, scanner):
        matches = _dob(scanner.detect("date of birth: 1990-03-15"))
        assert len(matches) == 1

    def test_iso_with_slash(self, scanner):
        matches = _dob(scanner.detect("birthdate 1990/03/15"))
        assert len(matches) == 1


class TestMonthDDYYYY:
    def test_month_dd_yyyy(self, scanner):
        matches = _dob(scanner.detect("born March 15, 1990"))
        assert len(matches) == 1

    def test_abbreviated_month(self, scanner):
        matches = _dob(scanner.detect("dob: Jan 5, 1985"))
        assert len(matches) == 1

    def test_no_comma(self, scanner):
        matches = _dob(scanner.detect("birthday January 15 1990"))
        assert len(matches) == 1


class TestDDMonthYYYY:
    def test_dd_month_yyyy(self, scanner):
        matches = _dob(scanner.detect("born 15 March 1990"))
        assert len(matches) == 1

    def test_ordinal_suffix(self, scanner):
        matches = _dob(scanner.detect("dob: 3rd March 1985"))
        assert len(matches) == 1

    def test_abbreviated_dd_month(self, scanner):
        matches = _dob(scanner.detect("birthday 1st Jan 2000"))
        assert len(matches) == 1


class TestISOTimestamp:
    def test_iso_with_timestamp(self, scanner):
        matches = _dob(scanner.detect("DOB: 1960-08-01T00:00:00"))
        assert len(matches) == 1
        assert "1960-08-01T00:00:00" in matches[0].text

    def test_iso_timestamp_with_born(self, scanner):
        matches = _dob(scanner.detect("born on 1995-03-07T00:00:00"))
        assert len(matches) == 1


class TestMonthOrdinal:
    def test_month_ordinal_st(self, scanner):
        matches = _dob(scanner.detect("DOB: July 21st, 1998"))
        assert len(matches) == 1

    def test_month_ordinal_nd(self, scanner):
        matches = _dob(scanner.detect("birthday October 22nd, 1986"))
        assert len(matches) == 1

    def test_month_ordinal_rd(self, scanner):
        matches = _dob(scanner.detect("dob: December 3rd, 1968"))
        assert len(matches) == 1

    def test_month_ordinal_th(self, scanner):
        matches = _dob(scanner.detect("born on November 12th, 2016"))
        assert len(matches) == 1


class TestMonthYY:
    def test_month_slash_yy(self, scanner):
        matches = _dob(scanner.detect("DOB: May/58"))
        assert len(matches) == 1

    def test_month_dash_yy(self, scanner):
        matches = _dob(scanner.detect("born on August-72"))
        assert len(matches) == 1

    def test_full_month_slash_yy(self, scanner):
        matches = _dob(scanner.detect("date of birth: November/85"))
        assert len(matches) == 1

    def test_abbreviated_month_slash_yy(self, scanner):
        matches = _dob(scanner.detect("DOB: Jan/90"))
        assert len(matches) == 1


class TestContextKeywords:
    def test_born_keyword(self, scanner):
        matches = _dob(scanner.detect("She was born 03/15/1990"))
        assert len(matches) == 1

    def test_dob_keyword(self, scanner):
        matches = _dob(scanner.detect("DOB: 1990-03-15"))
        assert len(matches) == 1

    def test_multilingual_french(self, scanner):
        matches = _dob(scanner.detect("date de naissance: 15/03/1990"))
        assert len(matches) == 1

    def test_multilingual_german(self, scanner):
        matches = _dob(scanner.detect("Geburtsdatum: 15.03.1990"))
        assert len(matches) == 1

    def test_no_context_no_match(self, scanner):
        matches = _dob(scanner.detect("The event is on 03/15/1990"))
        assert len(matches) == 0


class TestNegatives:
    def test_plain_date_no_context(self, scanner):
        matches = _dob(scanner.detect("Meeting scheduled for 03/15/2024"))
        assert len(matches) == 0

    def test_year_alone(self, scanner):
        matches = _dob(scanner.detect("born in 1990"))
        assert len(matches) == 0
