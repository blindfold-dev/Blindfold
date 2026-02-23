"""Core redaction tests for the regex PII scanner."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us", "eu"])


class TestRedactEmail:
    def test_redact_email(self, scanner):
        redacted, matches = scanner.redact("Contact support@example.com for details.")
        assert "[EMAIL_ADDRESS]" in redacted
        assert "support@example.com" not in redacted

    def test_redact_preserves_surrounding(self, scanner):
        redacted, _ = scanner.redact("Contact support@example.com for details.")
        assert redacted.startswith("Contact ")
        assert redacted.endswith(" for details.")


class TestRedactSSN:
    def test_redact_ssn(self, scanner):
        redacted, matches = scanner.redact("SSN: 123-45-6789")
        assert "[SSN]" in redacted
        assert "123-45-6789" not in redacted


class TestRedactMultiple:
    def test_redact_multiple_entities(self, scanner):
        redacted, matches = scanner.redact("Email john@acme.com, SSN 123-45-6789")
        assert "[EMAIL_ADDRESS]" in redacted
        assert "[SSN]" in redacted
        assert "john@acme.com" not in redacted
        assert "123-45-6789" not in redacted

    def test_redact_returns_matches(self, scanner):
        _, matches = scanner.redact("Email john@acme.com, SSN 123-45-6789")
        assert len(matches) >= 2
        types = {m.entity_type for m in matches}
        assert "Email Address" in types
        assert "Social Security Number" in types


class TestRedactNoPII:
    def test_redact_no_pii(self, scanner):
        text = "This is a normal sentence."
        redacted, matches = scanner.redact(text)
        assert redacted == text
        assert matches == []


class TestBlindfoldLocalRedact:
    def test_blindfold_no_key_uses_local_redact(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.redact("Email john@acme.com")
        assert "[EMAIL_ADDRESS]" in response.text
        assert response.entities_count >= 1
