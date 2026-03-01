"""Tests for local mode enhancements: method-level entities, policy resolution, region warning."""

import warnings

import pytest

from blindfold import Blindfold


class TestMethodLevelEntities:
    """Method-level entity filtering in local mode."""

    def setup_method(self):
        self.client = Blindfold()

    def test_detect_filters_by_entities(self):
        result = self.client.detect(
            "Email john@acme.com, SSN 123-45-6789",
            entities=["Email Address"],
        )
        types = [e.type for e in result.detected_entities]
        assert "Email Address" in types
        assert "Social Security Number" not in types

    def test_tokenize_filters_by_entities(self):
        result = self.client.tokenize(
            "Email john@acme.com, SSN 123-45-6789",
            entities=["Email Address"],
        )
        assert "<Email Address_1>" in result.text
        assert "123-45-6789" in result.text

    def test_redact_filters_by_entities(self):
        result = self.client.redact(
            "Email john@acme.com, SSN 123-45-6789",
            entities=["Email Address"],
        )
        assert "john@acme.com" not in result.text
        assert "123-45-6789" in result.text

    def test_mask_filters_by_entities(self):
        result = self.client.mask(
            "Email john@acme.com, SSN 123-45-6789",
            entities=["Email Address"],
        )
        assert "*" in result.text
        assert "123-45-6789" in result.text

    def test_hash_filters_by_entities(self):
        result = self.client.hash(
            "Email john@acme.com, SSN 123-45-6789",
            entities=["Email Address"],
        )
        assert "HASH_" in result.text
        assert "123-45-6789" in result.text

    def test_synthesize_filters_by_entities(self):
        result = self.client.synthesize(
            "Email john@acme.com, SSN 123-45-6789",
            entities=["Email Address"],
        )
        assert "john@acme.com" not in result.text
        assert "123-45-6789" in result.text

    def test_encrypt_filters_by_entities(self):
        result = self.client.encrypt(
            "Email john@acme.com, SSN 123-45-6789",
            encryption_key="my-secret-key-at-least-16-chars",
            entities=["Email Address"],
        )
        assert "john@acme.com" not in result.text
        assert "123-45-6789" in result.text

    def test_no_entities_detects_all(self):
        result = self.client.detect("Email john@acme.com, SSN 123-45-6789")
        assert result.entities_count >= 2


class TestPolicyResolution:
    """Policy resolution in local mode."""

    def setup_method(self):
        self.client = Blindfold()

    def test_basic_policy_resolves_to_correct_entities(self):
        result = self.client.detect(
            "Email john@acme.com, SSN 123-45-6789",
            policy="basic",
        )
        types = [e.type for e in result.detected_entities]
        assert "Email Address" in types
        # basic does not include SSN
        assert "Social Security Number" not in types

    def test_explicit_entities_override_policy(self):
        result = self.client.detect(
            "Email john@acme.com, SSN 123-45-6789",
            policy="basic",
            entities=["Social Security Number"],
        )
        types = [e.type for e in result.detected_entities]
        assert "Social Security Number" in types
        assert "Email Address" not in types

    def test_unknown_policy_warns(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = self.client.detect(
                "Email john@acme.com, SSN 123-45-6789",
                policy="nonexistent_policy",
            )
            assert len(w) == 1
            assert "Unknown policy 'nonexistent_policy'" in str(w[0].message)
        # Unknown policy means detect all entities
        assert result.entities_count >= 2

    def test_gdpr_eu_policy_includes_ip(self):
        result = self.client.detect("Server at 192.168.1.100", policy="gdpr_eu")
        types = [e.type for e in result.detected_entities]
        assert "IP Address" in types

    def test_policy_threshold_applies(self):
        result = self.client.detect("Email john@acme.com", policy="basic")
        assert result.entities_count >= 1

    def test_explicit_threshold_overrides_policy(self):
        result = self.client.detect(
            "Email john@acme.com",
            policy="basic",
            score_threshold=0.99,
        )
        assert result.entities_count == 0

    def test_tokenize_with_policy(self):
        result = self.client.tokenize(
            "Email john@acme.com, SSN 123-45-6789",
            policy="basic",
        )
        assert "<Email Address_1>" in result.text
        assert "123-45-6789" in result.text


class TestRegionWarning:
    """Region warning in local mode."""

    def test_warns_when_region_set_in_local_mode(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            Blindfold(region="eu")
            assert len(w) == 1
            assert "region='eu' has no effect in local mode" in str(w[0].message)

    def test_no_warning_with_api_key(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            Blindfold(api_key="bf_test_key", region="eu")
            assert len(w) == 0


class TestPoliciesFile:
    """Custom policies_file loading."""

    def test_custom_policies_file_merges(self, tmp_path):
        custom = tmp_path / "custom.json"
        custom.write_text('{"my_custom": {"entities": ["Email Address"], "threshold": 0.50}}')

        client = Blindfold(policies_file=str(custom))
        result = client.detect(
            "Email john@acme.com, SSN 123-45-6789",
            policy="my_custom",
        )
        types = [e.type for e in result.detected_entities]
        assert "Email Address" in types
        assert "Social Security Number" not in types

    def test_custom_policies_override_bundled(self, tmp_path):
        custom = tmp_path / "override.json"
        custom.write_text('{"basic": {"entities": ["Social Security Number"], "threshold": 0.10}}')

        client = Blindfold(policies_file=str(custom))
        result = client.detect(
            "Email john@acme.com, SSN 123-45-6789",
            policy="basic",
        )
        types = [e.type for e in result.detected_entities]
        assert "Social Security Number" in types
        assert "Email Address" not in types
