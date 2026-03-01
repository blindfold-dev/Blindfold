"""URL detection tests."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner()


def _url(matches):
    return [m for m in matches if m.entity_type == "URL"]


class TestValidURLs:
    def test_simple_url(self, scanner):
        matches = _url(scanner.detect("Visit https://example.com"))
        assert len(matches) == 1

    def test_url_with_path(self, scanner):
        matches = _url(scanner.detect("See https://example.com/page/about"))
        assert len(matches) == 1

    def test_http_url(self, scanner):
        matches = _url(scanner.detect("Go to http://example.org"))
        assert len(matches) == 1

    def test_subdomain(self, scanner):
        matches = _url(scanner.detect("Visit https://docs.example.io/api"))
        assert len(matches) == 1

    def test_common_tlds(self, scanner):
        for tld in ["com", "org", "net", "io", "dev", "co", "ai"]:
            matches = _url(scanner.detect(f"https://example.{tld}"))
            assert len(matches) == 1, f"Failed for TLD: {tld}"


class TestTLDValidation:
    def test_invalid_tld_rejected(self, scanner):
        matches = _url(scanner.detect("https://example.invalidtld"))
        assert len(matches) == 0

    def test_fake_tld_rejected(self, scanner):
        matches = _url(scanner.detect("https://test.localhost"))
        assert len(matches) == 0


class TestTrailingPunctuation:
    def test_url_followed_by_period(self, scanner):
        matches = _url(scanner.detect("See https://example.com."))
        assert len(matches) == 1
        assert not matches[0].text.endswith(".")

    def test_url_in_parens(self, scanner):
        matches = _url(scanner.detect("(https://example.com)"))
        assert len(matches) == 1
        assert not matches[0].text.endswith(")")


class TestNegatives:
    def test_no_scheme_not_detected(self, scanner):
        matches = _url(scanner.detect("Visit example.com"))
        assert len(matches) == 0

    def test_ftp_not_detected(self, scanner):
        matches = _url(scanner.detect("ftp://files.example.com"))
        assert len(matches) == 0
