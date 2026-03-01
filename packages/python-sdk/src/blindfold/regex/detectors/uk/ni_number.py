"""UK National Insurance Number detector (scrubadub-inspired pattern)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("uk")
class NiNumberDetector(RegexDetector):
    entity_type = EntityType.NI_NUMBER
    score = 0.90
    # Scrubadub pattern: negative lookaheads for invalid prefixes
    pattern = re.compile(
        r"\b"
        r"(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)"
        r"[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]"
        r"\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]"
        r"\b",
        re.IGNORECASE,
    )
