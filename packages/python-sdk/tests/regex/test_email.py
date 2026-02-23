"""Email address detection tests."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(entities=[EntityType.EMAIL_ADDRESS])


def _emails(matches):
    return [m for m in matches if m.entity_type == "Email Address"]


class TestValidEmails:
    def test_standard_email(self, scanner):
        matches = _emails(scanner.detect("Email: user@example.com"))
        assert len(matches) == 1
        assert matches[0].text == "user@example.com"

    def test_email_with_dots(self, scanner):
        matches = _emails(scanner.detect("Email: first.last@company.co.uk"))
        assert len(matches) == 1

    def test_email_with_plus(self, scanner):
        matches = _emails(scanner.detect("Email: user+tag@gmail.com"))
        assert len(matches) == 1

    def test_email_with_hyphen_domain(self, scanner):
        matches = _emails(scanner.detect("Email: admin@my-domain.org"))
        assert len(matches) == 1


class TestInvalidEmails:
    def test_no_user(self, scanner):
        assert _emails(scanner.detect("Invalid: @nouser.com")) == []

    def test_no_domain(self, scanner):
        assert _emails(scanner.detect("Invalid: user@")) == []

    def test_no_tld(self, scanner):
        assert _emails(scanner.detect("Invalid: user@domain")) == []
