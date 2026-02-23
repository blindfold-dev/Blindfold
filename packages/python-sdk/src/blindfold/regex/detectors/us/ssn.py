"""US Social Security Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ssn_valid_format


@register_region("us")
class SsnDetector(RegexDetector):
    entity_type = EntityType.SSN
    score = 0.85
    context_keywords = [
        "ssn", "social security", "social sec", "ss#", "ss #",
    ]
    context_required = False
    context_window = 50

    # SSN format with negative lookaheads for invalid area/group/serial
    pattern = re.compile(
        r"\b(?!000|666|9\d{2})\d{3}"
        r"[-\s.]"
        r"(?!00)\d{2}"
        r"[-\s.]"
        r"(?!0000)\d{4}\b"
    )
    validator = staticmethod(ssn_valid_format)
