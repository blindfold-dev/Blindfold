"""Base detector classes inspired by scrubadub's architecture"""

import re
from typing import Callable, List, Optional, Pattern

from .entities import EntityType, PIIMatch


class Detector:
    """Base class for all PII detectors."""

    entity_type: EntityType
    score: float = 0.85
    context_keywords: List[str] = []
    context_required: bool = False
    context_window: int = 50
    locale: str = ""

    def iter_matches(self, text: str) -> List[PIIMatch]:
        raise NotImplementedError

    def _has_context(self, text: str, start: int) -> bool:
        """Check if any context keyword appears near the match position."""
        if not self.context_keywords:
            return True
        window_start = max(0, start - self.context_window)
        window = text[window_start:start].lower()
        return any(kw in window for kw in self.context_keywords)


class RegexDetector(Detector):
    """Detector using a single compiled regex pattern with optional validation."""

    pattern: Pattern[str]
    validator: Optional[Callable[[str], bool]] = None

    def pre_check(self, text: str) -> bool:
        """Optional fast pre-check before running regex. Override in subclasses."""
        return True

    def iter_matches(self, text: str) -> List[PIIMatch]:
        if not self.pre_check(text):
            return []

        results: List[PIIMatch] = []
        for match in self.pattern.finditer(text):
            matched_text = match.group()
            start = match.start()
            end = match.end()

            if self.context_required and not self._has_context(text, start):
                continue

            score = self.score
            if self.validator:
                if not self.validator(matched_text):
                    continue
                score = 1.0
            elif self.context_keywords and self._has_context(text, start):
                score = min(score + 0.05, 0.95)

            results.append(PIIMatch(
                entity_type=self.entity_type.value,
                text=matched_text,
                start=start,
                end=end,
                score=score,
            ))
        return results


class RegionDetector(Detector):
    """Detector with locale-specific regex patterns.

    Subclasses define ``region_patterns``, a dict mapping locale codes to
    compiled regex patterns.  The registry selects the appropriate pattern
    based on the user's requested locales.
    """

    region_patterns: dict = {}  # locale -> compiled Pattern
    validator: Optional[Callable[[str], bool]] = None

    def __init__(self, locale: str = "") -> None:
        self.locale = locale

    def iter_matches(self, text: str) -> List[PIIMatch]:
        pattern = self.region_patterns.get(self.locale)
        if pattern is None:
            return []

        results: List[PIIMatch] = []
        for match in pattern.finditer(text):
            matched_text = match.group()
            start = match.start()
            end = match.end()

            if self.context_required and not self._has_context(text, start):
                continue

            score = self.score
            if self.validator:
                if not self.validator(matched_text):
                    continue
                score = 1.0
            elif self.context_keywords and self._has_context(text, start):
                score = min(score + 0.05, 0.95)

            results.append(PIIMatch(
                entity_type=self.entity_type.value,
                text=matched_text,
                start=start,
                end=end,
                score=score,
            ))
        return results
