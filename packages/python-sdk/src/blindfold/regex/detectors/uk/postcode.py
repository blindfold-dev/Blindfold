"""UK Postcode detector (scrubadub-inspired comprehensive pattern)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("uk")
class UkPostcodeDetector(RegexDetector):
    entity_type = EntityType.UK_POSTCODE
    score = 0.85
    # Comprehensive UK postcode pattern covering all valid formats
    pattern = re.compile(
        r"\b(?:"
        r"[A-Z]{1,2}\d[A-Z\d]?"  # Area + district
        r"\s?"
        r"\d[A-Z]{2}"            # Sector + unit
        r")\b",
        re.IGNORECASE,
    )
