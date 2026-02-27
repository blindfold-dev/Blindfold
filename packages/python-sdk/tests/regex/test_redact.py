"""Core tests for the regex PII scanner."""

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us", "eu"])


class TestRedactEmail:
    def test_redact_email(self, scanner):
        redacted, matches = scanner.redact("Contact support@example.com for details.")
        assert "support@example.com" not in redacted
        assert redacted == "Contact for details."

    def test_redact_preserves_surrounding(self, scanner):
        redacted, _ = scanner.redact("Contact support@example.com for details.")
        assert redacted.startswith("Contact")
        assert redacted.endswith("for details.")


class TestRedactSSN:
    def test_redact_ssn(self, scanner):
        redacted, matches = scanner.redact("SSN: 123-45-6789")
        assert "123-45-6789" not in redacted


class TestRedactMultiple:
    def test_redact_multiple_entities(self, scanner):
        redacted, matches = scanner.redact("Email john@acme.com, SSN 123-45-6789")
        assert "john@acme.com" not in redacted
        assert "123-45-6789" not in redacted
        assert redacted == "Email, SSN"

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


class TestTokenize:
    def test_tokenize_email(self, scanner):
        result = scanner.tokenize("Contact support@example.com for details.")
        assert "<Email Address_1>" in result.text
        assert "support@example.com" not in result.text
        assert result.mapping["<Email Address_1>"] == "support@example.com"
        assert len(result.matches) == 1

    def test_tokenize_multiple_same_type(self, scanner):
        result = scanner.tokenize("Email john@acme.com and jane@acme.com")
        assert "<Email Address_1>" in result.text
        assert "<Email Address_2>" in result.text
        assert result.mapping["<Email Address_1>"] == "john@acme.com"
        assert result.mapping["<Email Address_2>"] == "jane@acme.com"

    def test_tokenize_different_types(self, scanner):
        result = scanner.tokenize("Email john@acme.com, SSN 123-45-6789")
        assert "<Email Address_1>" in result.text
        assert "<Social Security Number_1>" in result.text
        assert len(result.mapping) >= 2

    def test_tokenize_no_pii(self, scanner):
        result = scanner.tokenize("This is normal text.")
        assert result.text == "This is normal text."
        assert result.mapping == {}
        assert result.matches == []


class TestMask:
    def test_mask_email_default(self, scanner):
        result = scanner.mask("Contact support@example.com for details.")
        assert "support@example.com" not in result.text
        assert "sup" in result.text
        assert "*" in result.text
        assert len(result.matches) == 1

    def test_mask_from_end(self, scanner):
        result = scanner.mask("SSN: 123-45-6789", chars_to_show=4, from_end=True)
        assert "123-45-6789" not in result.text
        assert "6789" in result.text

    def test_mask_custom_char(self, scanner):
        result = scanner.mask("Contact support@example.com", chars_to_show=3, masking_char="#")
        assert "#" in result.text
        assert "*" not in result.text

    def test_mask_no_pii(self, scanner):
        result = scanner.mask("No PII here.")
        assert result.text == "No PII here."
        assert result.matches == []


class TestHash:
    def test_hash_email_default(self, scanner):
        result = scanner.hash("Contact support@example.com for details.")
        assert "support@example.com" not in result.text
        assert "HASH_" in result.text
        assert len(result.matches) == 1

    def test_hash_deterministic(self, scanner):
        r1 = scanner.hash("Email support@example.com")
        r2 = scanner.hash("Email support@example.com")
        assert r1.text == r2.text

    def test_hash_custom_prefix_length(self, scanner):
        result = scanner.hash("Email support@example.com", hash_prefix="H_", hash_length=8)
        assert "H_" in result.text
        import re
        assert re.search(r"H_[0-9a-f]{8}", result.text)

    def test_hash_no_pii(self, scanner):
        result = scanner.hash("Normal text.")
        assert result.text == "Normal text."
        assert result.matches == []


class TestEncrypt:
    KEY = "my-secret-key-1234567890"

    def test_encrypt_email(self, scanner):
        result = scanner.encrypt("Contact support@example.com for details.", self.KEY)
        assert "support@example.com" not in result.text
        assert len(result.matches) == 1

    def test_encrypt_different_each_call(self, scanner):
        r1 = scanner.encrypt("Email support@example.com", self.KEY)
        r2 = scanner.encrypt("Email support@example.com", self.KEY)
        assert r1.text != r2.text

    def test_encrypt_short_key_raises(self, scanner):
        with pytest.raises(ValueError):
            scanner.encrypt("Email support@example.com", "short")

    def test_encrypt_no_pii(self, scanner):
        result = scanner.encrypt("Normal text.", self.KEY)
        assert result.text == "Normal text."
        assert result.matches == []


class TestSynthesize:
    def test_synthesize_email(self, scanner):
        result = scanner.synthesize("Contact support@example.com for details.")
        assert "support@example.com" not in result.text
        assert "@" in result.text
        assert len(result.matches) == 1

    def test_synthesize_ssn_format_preserving(self, scanner):
        result = scanner.synthesize("SSN: 123-45-6789")
        assert "123-45-6789" not in result.text
        # Should preserve separator pattern: ###-##-####
        import re
        assert re.search(r"\d{3}-\d{2}-\d{4}", result.text)

    def test_synthesize_produces_different_results(self, scanner):
        results = set()
        for _ in range(5):
            results.add(scanner.synthesize("Email john@acme.com").text)
        assert len(results) > 1

    def test_synthesize_no_pii(self, scanner):
        result = scanner.synthesize("No sensitive data here.")
        assert result.text == "No sensitive data here."
        assert result.matches == []

    def test_synthesize_ip_address(self, scanner):
        result = scanner.synthesize("Server at 192.168.1.100")
        assert "192.168.1.100" not in result.text
        import re
        assert re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", result.text)


class TestBlindfoldLocalSynthesize:
    def test_blindfold_no_key_uses_local_synthesize(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.synthesize("Email john@acme.com")
        assert "john@acme.com" not in response.text
        assert response.entities_count >= 1

    def test_blindfold_local_synthesize_different_each_call(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        results = set()
        for _ in range(5):
            results.add(client.synthesize("Email john@acme.com").text)
        assert len(results) > 1


class TestBlindfoldLocalRedact:
    def test_blindfold_no_key_uses_local_redact(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.redact("Email john@acme.com")
        assert "john@acme.com" not in response.text
        assert response.entities_count >= 1


class TestBlindfoldLocalTokenize:
    def test_blindfold_no_key_uses_local_tokenize(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.tokenize("Email john@acme.com")
        assert "<Email Address_1>" in response.text
        assert response.mapping["<Email Address_1>"] == "john@acme.com"
        assert response.entities_count >= 1


class TestBlindfoldLocalMask:
    def test_blindfold_no_key_uses_local_mask(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.mask("Email john@acme.com")
        assert "john@acme.com" not in response.text
        assert response.entities_count >= 1


class TestBlindfoldLocalHash:
    def test_blindfold_no_key_uses_local_hash(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.hash("Email john@acme.com")
        assert "john@acme.com" not in response.text
        assert "HASH_" in response.text
        assert response.entities_count >= 1


class TestBlindfoldLocalEncrypt:
    def test_blindfold_no_key_uses_local_encrypt(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        response = client.encrypt("Email john@acme.com", encryption_key="my-secret-key-1234567890")
        assert "john@acme.com" not in response.text
        assert response.entities_count >= 1

    def test_blindfold_no_key_encrypt_requires_key(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        with pytest.raises(ValueError):
            client.encrypt("Email john@acme.com")


class TestBlindfoldLocalesAndEntities:
    def test_cz_locale_detects_czech_birth_number(self):
        from blindfold.client import Blindfold
        client = Blindfold(locales=["cz"])
        result = client.detect("Rodne cislo: 710319/2745")
        types = [e.type for e in result.detected_entities]
        assert "Czech Birth Number" in types

    def test_us_locale_does_not_detect_czech_birth_number(self):
        from blindfold.client import Blindfold
        client = Blindfold(locales=["us"])
        result = client.detect("Rodne cislo: 710319/2745")
        types = [e.type for e in result.detected_entities]
        assert "Czech Birth Number" not in types

    def test_entities_filter_only_emails(self):
        from blindfold.client import Blindfold
        client = Blindfold()
        result = client.detect("Email john@acme.com, SSN 123-45-6789", entities=["Email Address"])
        types = [e.type for e in result.detected_entities]
        assert "Email Address" in types
        assert "Social Security Number" not in types

    def test_locales_and_entities_combined(self):
        from blindfold.client import Blindfold
        client = Blindfold(locales=["cz"])
        result = client.detect("Rodne cislo: 710319/2745, email john@acme.com", entities=["Czech Birth Number"])
        types = [e.type for e in result.detected_entities]
        assert "Czech Birth Number" in types
        assert "Email Address" not in types
