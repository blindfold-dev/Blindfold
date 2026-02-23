"""PIIScanner: orchestrates detectors, deduplicates results, produces output"""

from typing import List, Optional, Set, Tuple

from .entities import EntityType, PIIMatch, REDACTION_LABELS
from .registry import DetectorRegistry

# Force import of all detectors so they auto-register
from . import detectors as _detectors  # noqa: F401


class PIIScanner:
    """Local regex-based PII scanner.

    Usage::

        scanner = PIIScanner(locales=["us", "eu"])
        matches = scanner.detect("Email john@acme.com, SSN 123-45-6789")
        redacted, matches = scanner.redact("Email john@acme.com")

    Args:
        locales: List of locale codes to enable (default ``["us"]``).
        entities: Optional list of :class:`EntityType` values to restrict detection.
    """

    def __init__(
        self,
        locales: Optional[List[str]] = None,
        entities: Optional[List[EntityType]] = None,
    ) -> None:
        entity_types: Optional[Set[str]] = None
        if entities:
            entity_types = {e.value for e in entities}
        self._registry = DetectorRegistry(
            locales=locales,
            entity_types=entity_types,
        )

    def detect(self, text: str) -> List[PIIMatch]:
        """Detect PII entities in *text* and return deduplicated matches."""
        all_matches: List[PIIMatch] = []
        for detector in self._registry.detectors:
            all_matches.extend(detector.iter_matches(text))
        return self._deduplicate(all_matches)

    def redact(self, text: str) -> Tuple[str, List[PIIMatch]]:
        """Detect and replace PII with ``[LABEL]`` placeholders.

        Returns a tuple of (redacted_text, detected_matches).
        """
        matches = self.detect(text)
        if not matches:
            return text, []

        # Sort by start position descending so replacements don't shift indices
        sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text
        for m in sorted_matches:
            label = REDACTION_LABELS.get(m.entity_type, m.entity_type.upper())
            result = result[:m.start] + "[" + label + "]" + result[m.end:]

        return result, matches

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
