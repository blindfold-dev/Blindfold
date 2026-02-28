"""PIIScanner: orchestrates detectors, deduplicates results, produces output"""

import base64
import hashlib
import os
from typing import Dict, List, Optional, Tuple

from .entities import EntityType, PIIMatch
from .registry import DetectorRegistry
from .synthesizers import synthesize_value

# Force import of all detectors so they auto-register
from . import detectors as _detectors  # noqa: F401


class TokenizeResult:
    """Result of tokenize operation."""

    __slots__ = ("text", "mapping", "matches")

    def __init__(self, text: str, mapping: Dict[str, str], matches: List[PIIMatch]) -> None:
        self.text = text
        self.mapping = mapping
        self.matches = matches


class MaskResult:
    """Result of mask operation."""

    __slots__ = ("text", "matches")

    def __init__(self, text: str, matches: List[PIIMatch]) -> None:
        self.text = text
        self.matches = matches


class HashResult:
    """Result of hash operation."""

    __slots__ = ("text", "matches")

    def __init__(self, text: str, matches: List[PIIMatch]) -> None:
        self.text = text
        self.matches = matches


class EncryptResult:
    """Result of encrypt operation."""

    __slots__ = ("text", "matches")

    def __init__(self, text: str, matches: List[PIIMatch]) -> None:
        self.text = text
        self.matches = matches


class SynthesizeResult:
    """Result of synthesize operation."""

    __slots__ = ("text", "matches")

    def __init__(self, text: str, matches: List[PIIMatch]) -> None:
        self.text = text
        self.matches = matches


class PIIScanner:
    """Local regex-based PII scanner.

    Usage::

        scanner = PIIScanner(locales=["us", "eu"])
        matches = scanner.detect("Email john@acme.com, SSN 123-45-6789")
        redacted, matches = scanner.redact("Email john@acme.com")

    Args:
        locales: List of locale codes to enable (default ``["us"]``).
    """

    def __init__(
        self,
        locales: Optional[List[str]] = None,
    ) -> None:
        self._registry = DetectorRegistry(locales=locales)

    def detect(
        self,
        text: str,
        entities: Optional[List[str]] = None,
    ) -> List[PIIMatch]:
        """Detect PII entities in *text* and return deduplicated matches.

        Args:
            text: Text to scan.
            entities: Optional list of entity type names to restrict detection.
        """
        detectors = self._registry.detectors
        if entities:
            entity_set = set(entities)
            detectors = [d for d in detectors if d.entity_type.value in entity_set]
        has_digit = any(c.isdigit() for c in text)
        text_lower = text.lower()
        all_matches: List[PIIMatch] = []
        for detector in detectors:
            if detector.needs_digit and not has_digit:
                continue
            detector._text_lower = text_lower
            all_matches.extend(detector.iter_matches(text))
            detector._text_lower = None
        return self._deduplicate(all_matches)

    def redact(
        self,
        text: str,
        entities: Optional[List[str]] = None,
    ) -> Tuple[str, List[PIIMatch]]:
        """Detect and remove PII from text.

        Returns a tuple of (redacted_text, detected_matches).
        """
        matches = self.detect(text, entities=entities)
        if not matches:
            return text, []

        # Sort by start position descending so replacements don't shift indices
        sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text
        for m in sorted_matches:
            # Also consume a preceding space to keep output clean
            start = m.start - 1 if m.start > 0 and result[m.start - 1] == " " else m.start
            result = result[:start] + result[m.end:]

        return result, matches

    def tokenize(self, text: str, entities: Optional[List[str]] = None) -> TokenizeResult:
        """Detect PII and replace with numbered tokens like ``<Email Address_1>``.

        Returns a :class:`TokenizeResult` with tokenized text, mapping, and matches.
        """
        matches = self.detect(text, entities=entities)
        if not matches:
            return TokenizeResult(text=text, mapping={}, matches=[])

        # Assign per-type counters in reading order (ascending start position)
        sorted_asc = sorted(matches, key=lambda m: m.start)
        counters: Dict[str, int] = {}
        token_map: Dict[int, str] = {}  # match id -> token
        mapping: Dict[str, str] = {}

        for m in sorted_asc:
            count = counters.get(m.entity_type, 0) + 1
            counters[m.entity_type] = count
            token = f"<{m.entity_type}_{count}>"
            token_map[id(m)] = token
            mapping[token] = m.text

        # Replace in descending position order
        sorted_desc = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text
        for m in sorted_desc:
            token = token_map[id(m)]
            result = result[:m.start] + token + result[m.end:]

        return TokenizeResult(text=result, mapping=mapping, matches=matches)

    def mask(
        self,
        text: str,
        chars_to_show: int = 3,
        from_end: bool = False,
        masking_char: str = "*",
        entities: Optional[List[str]] = None,
    ) -> MaskResult:
        """Detect PII and partially mask each match."""
        matches = self.detect(text, entities=entities)
        if not matches:
            return MaskResult(text=text, matches=[])

        sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text
        for m in sorted_matches:
            original = m.text
            show = min(chars_to_show, len(original))
            mask_len = len(original) - show
            if from_end:
                masked = masking_char * mask_len + original[mask_len:]
            else:
                masked = original[:show] + masking_char * mask_len
            result = result[:m.start] + masked + result[m.end:]

        return MaskResult(text=result, matches=matches)

    def hash(
        self,
        text: str,
        hash_type: str = "sha256",
        hash_prefix: str = "HASH_",
        hash_length: int = 16,
        entities: Optional[List[str]] = None,
    ) -> HashResult:
        """Detect PII and replace each match with a deterministic hash."""
        matches = self.detect(text, entities=entities)
        if not matches:
            return HashResult(text=text, matches=[])

        sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text
        for m in sorted_matches:
            h = hashlib.new(hash_type)
            h.update(m.text.encode("utf-8"))
            digest = h.hexdigest()[:hash_length]
            replacement = hash_prefix + digest
            result = result[:m.start] + replacement + result[m.end:]

        return HashResult(text=result, matches=matches)

    def encrypt(self, text: str, encryption_key: str, entities: Optional[List[str]] = None) -> EncryptResult:
        """Detect PII and encrypt each match with AES-256-CBC.

        Args:
            text: Text to process.
            encryption_key: Required, minimum 16 characters.

        Raises:
            ValueError: If *encryption_key* is too short.
            ImportError: If the ``cryptography`` package is not installed.
        """
        if not encryption_key or len(encryption_key) < 16:
            raise ValueError(
                "encryption_key is required and must be at least 16 characters for local encryption"
            )

        try:
            from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
            from cryptography.hazmat.primitives import padding as sym_padding
        except ImportError:
            raise ImportError(
                "The 'cryptography' package is required for local encryption. "
                "Install it with: pip install cryptography"
            )

        matches = self.detect(text, entities=entities)
        if not matches:
            return EncryptResult(text=text, matches=[])

        # Derive a 32-byte key via SHA-256
        derived_key = hashlib.sha256(encryption_key.encode("utf-8")).digest()

        sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text
        for m in sorted_matches:
            iv = os.urandom(16)
            cipher = Cipher(algorithms.AES(derived_key), modes.CBC(iv))
            encryptor = cipher.encryptor()
            padder = sym_padding.PKCS7(128).padder()
            padded = padder.update(m.text.encode("utf-8")) + padder.finalize()
            ct = encryptor.update(padded) + encryptor.finalize()
            combined = iv + ct
            replacement = base64.b64encode(combined).decode("ascii")
            result = result[:m.start] + replacement + result[m.end:]

        return EncryptResult(text=result, matches=matches)

    def synthesize(self, text: str, language: Optional[str] = None, entities: Optional[List[str]] = None) -> SynthesizeResult:
        """Detect PII and replace each match with format-preserving synthetic data.

        Args:
            text: Text to process.
            language: Accepted for API compatibility but ignored locally.
        """
        matches = self.detect(text, entities=entities)
        if not matches:
            return SynthesizeResult(text=text, matches=[])

        sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text
        for m in sorted_matches:
            replacement = synthesize_value(m.entity_type, m.text)
            result = result[:m.start] + replacement + result[m.end:]

        return SynthesizeResult(text=result, matches=matches)

    @staticmethod
    def _deduplicate(matches: List[PIIMatch]) -> List[PIIMatch]:
        """Remove overlapping matches, preferring higher score then longer span."""
        if not matches:
            return []
        # Sort by start ascending, then by score descending, then span length descending
        matches.sort(key=lambda m: (m.start, -m.score, -(m.end - m.start)))
        result: List[PIIMatch] = []
        last_end = -1
        for m in matches:
            if m.start >= last_end:
                result.append(m)
                last_end = m.end
        return result
