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


class TestContextScoring:
    """Validator + context = 1.0, validator + no context < 1.0."""

    def test_ssn_with_context_scores_1(self, scanner):
        matches = scanner.detect("My SSN is 123-45-6789.")
        ssns = [m for m in matches if m.entity_type == "Social Security Number"]
        assert len(ssns) == 1
        assert ssns[0].score == 1.0

    def test_ssn_without_context_scores_below_1(self, scanner):
        matches = scanner.detect("Reference: 123-45-6789.")
        ssns = [m for m in matches if m.entity_type == "Social Security Number"]
        assert len(ssns) == 1
        assert ssns[0].score < 1.0

    def test_zip_with_context_scores_1(self, scanner):
        matches = scanner.detect("Shipping address, zip code 90210.")
        zips = [m for m in matches if m.entity_type == "ZIP Code"]
        assert len(zips) == 1
        assert zips[0].score == 1.0

    def test_dob_with_context_scores_1(self, scanner):
        matches = scanner.detect("Date of birth: 03/15/1990.")
        dobs = [m for m in matches if m.entity_type == "Date of Birth"]
        assert len(dobs) >= 1
        assert dobs[0].score == 1.0


class TestBidirectionalContext:
    """Context keywords after the match should also boost scores."""

    def test_ssn_context_after_match(self, scanner):
        # "social security" appears AFTER the number
        matches = scanner.detect("ID 123-45-6789 is a social security number.")
        ssns = [m for m in matches if m.entity_type == "Social Security Number"]
        assert len(ssns) == 1
        assert ssns[0].score == 1.0

    def test_ssn_no_sep_context_after_match(self, scanner):
        # Bare 9-digit SSN with context after
        matches = scanner.detect("Number 123456789 is the ssn on file.")
        ssns = [m for m in matches if m.entity_type == "Social Security Number"]
        assert len(ssns) == 1
        assert ssns[0].score == 1.0

    def test_dob_context_after_match(self, scanner):
        matches = scanner.detect("03/15/1990 is the date of birth on record.")
        dobs = [m for m in matches if m.entity_type == "Date of Birth"]
        assert len(dobs) >= 1
        assert dobs[0].score == 1.0

    def test_zip_context_after_match(self, scanner):
        matches = scanner.detect("90210 is the zip code.")
        zips = [m for m in matches if m.entity_type == "ZIP Code"]
        assert len(zips) == 1
        assert zips[0].score == 1.0


class TestPhoneContextScoring:
    """Phone numbers should score higher with context keywords."""

    def test_phone_with_context_scores_1(self, scanner):
        matches = scanner.detect("Call me at (212) 555-1234 today.")
        phones = [m for m in matches if m.entity_type == "Phone Number"]
        assert len(phones) == 1
        assert phones[0].score == 1.0

    def test_phone_with_tel_context(self, scanner):
        matches = scanner.detect("Tel: +1-212-555-1234")
        phones = [m for m in matches if m.entity_type == "Phone Number"]
        assert len(phones) == 1
        assert phones[0].score == 1.0

    def test_phone_without_context_scores_below_1(self, scanner):
        matches = scanner.detect("(212) 555-1234")
        phones = [m for m in matches if m.entity_type == "Phone Number"]
        assert len(phones) == 1
        assert phones[0].score < 1.0


class TestBackwardCompatibility:
    """Detectors without context_keywords should keep their original scores."""

    def test_email_score_unchanged(self, scanner):
        matches = scanner.detect("user@example.com")
        emails = [m for m in matches if m.entity_type == "Email Address"]
        assert len(emails) == 1
        assert emails[0].score == 0.95

    def test_mac_address_score_unchanged(self, scanner):
        matches = scanner.detect("MAC: 00:1A:2B:3C:4D:5E")
        macs = [m for m in matches if m.entity_type == "MAC Address"]
        assert len(macs) == 1
        assert macs[0].score == 0.95
