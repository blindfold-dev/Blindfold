"""Performance tests for the regex PII scanner."""

import time

import pytest

from blindfold.regex import PIIScanner


@pytest.fixture
def scanner():
    return PIIScanner(locales=["us", "eu", "uk"])


class TestPerformance:
    def test_typical_text_under_50ms(self, scanner):
        text = (
            "Dear John Smith, your account has been updated. "
            "Please verify your email at john.smith@example.com "
            "or call us at +1-555-867-5309. Your SSN 123-45-6789 "
            "is on file. Payment was made with card 4532015112830366. "
            "Your IP address 192.168.1.100 was logged. "
            "For EU customers, IBAN DE89370400440532013000 is accepted. "
            "Visit https://example.com/account for more details. "
            "Reference number: 2024-ABC-12345."
        )
        start = time.perf_counter()
        matches = scanner.detect(text)
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert elapsed_ms < 50, f"Detection took {elapsed_ms:.1f}ms"
        assert len(matches) > 0

    def test_empty_string_fast(self, scanner):
        start = time.perf_counter()
        matches = scanner.detect("")
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert elapsed_ms < 5
        assert matches == []
