"""Core detection tests for the regex PII scanner."""

import pytest

from blindfold.regex import PIIScanner, EntityType


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us", "eu"])


class TestDetectEmail:
    def test_detect_email_in_text(self, scanner):
        matches = scanner.detect("Contact us at support@example.com for help.")
        emails = [m for m in matches if m.entity_type == "Email Address"]
        assert len(emails) == 1
        assert emails[0].text == "support@example.com"

    def test_detect_email_score(self, scanner):
        matches = scanner.detect("Email: user@domain.org")
        emails = [m for m in matches if m.entity_type == "Email Address"]
        assert len(emails) == 1
        assert emails[0].score >= 0.9


class TestDetectSSN:
    def test_detect_ssn_in_text(self, scanner):
        matches = scanner.detect("My SSN is 123-45-6789.")
        ssns = [m for m in matches if m.entity_type == "Social Security Number"]
        assert len(ssns) == 1
        assert ssns[0].text == "123-45-6789"


class TestDetectMultiple:
    def test_detect_multiple_entities(self, scanner):
        matches = scanner.detect("Email john@acme.com, SSN 123-45-6789")
        types = {m.entity_type for m in matches}
        assert "Email Address" in types
        assert "Social Security Number" in types
        assert len(matches) >= 2


class TestDetectEmpty:
    def test_detect_empty_text(self, scanner):
        assert scanner.detect("") == []

    def test_detect_no_pii_text(self, scanner):
        assert scanner.detect("Just a regular sentence with no personal data.") == []


class TestDetectPositions:
    def test_detect_correct_start_end(self, scanner):
        text = "Email: user@example.com is valid"
        matches = scanner.detect(text)
        emails = [m for m in matches if m.entity_type == "Email Address"]
        assert len(emails) == 1
        assert text[emails[0].start:emails[0].end] == "user@example.com"


class TestBlindfoldLocalDetect:
    def test_blindfold_no_key_uses_local_detect(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.detect("Email john@acme.com")
        assert response.entities_count >= 1
        assert "Email Address" in [e.type for e in response.detected_entities]
