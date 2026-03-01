"""US Social Security Number detector"""

import re
from typing import List

from ...base import RegexDetector
from ...entities import EntityType, PIIMatch
from ...registry import register_region
from ...validators import ssn_valid_format

# SSN with separators (dashes, spaces, or dots)
_SSN_WITH_SEP = re.compile(
    r"\b(?!000|666|9\d{2})\d{3}"
    r"[-\s.]"
    r"(?!00)\d{2}"
    r"[-\s.]"
    r"(?!0000)\d{4}\b"
)

# SSN without separators (9 bare digits) — requires context to avoid noise
_SSN_NO_SEP = re.compile(
    r"\b(?!000|666|9\d{2})\d{3}"
    r"(?!00)\d{2}"
    r"(?!0000)\d{4}\b"
)


@register_region("us")
class SsnDetector(RegexDetector):
    entity_type = EntityType.SSN
    score = 0.85
    context_keywords = [
        "ssn", "social security", "social sec", "ss#", "ss #",
        "social", "tax id", "taxpayer", "tin",
        "social number", "soc number", "socialnum",
    ]
    context_required = False
    context_window = 100

    # Primary pattern (with separators) — used by base class pre_check
    pattern = _SSN_WITH_SEP
    validator = staticmethod(ssn_valid_format)

    def iter_matches(self, text: str) -> List[PIIMatch]:
        results: List[PIIMatch] = []

        # Branch 1: SSN with separators (no context required)
        for match in _SSN_WITH_SEP.finditer(text):
            matched_text = match.group()
            if not ssn_valid_format(matched_text):
                continue
            has_ctx = self._has_context(text, match.start(), match.end())
            score = 1.0 if has_ctx else self.score
            results.append(PIIMatch(
                entity_type=self.entity_type.value,
                text=matched_text,
                start=match.start(),
                end=match.end(),
                score=score,
            ))

        # Branch 2: SSN without separators (context REQUIRED)
        for match in _SSN_NO_SEP.finditer(text):
            matched_text = match.group()
            start = match.start()
            end = match.end()
            # Skip if this overlaps with an already-found separated SSN
            if any(r.start <= start < r.end for r in results):
                continue
            if not ssn_valid_format(matched_text):
                continue
            if not self._has_context(text, start, end):
                continue
            results.append(PIIMatch(
                entity_type=self.entity_type.value,
                text=matched_text,
                start=start,
                end=end,
                score=1.0,
            ))

        return results
