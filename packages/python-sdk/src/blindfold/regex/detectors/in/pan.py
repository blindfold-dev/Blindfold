"""Indian PAN (Permanent Account Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import in_pan_valid


@register_region("in")
class InPanDetector(RegexDetector):
    entity_type = EntityType.IN_PAN
    score = 0.85
    context_keywords = [
        "pan", "permanent account number", "income tax", "pan card",
    ]
    context_required = True
    context_window = 50

    # AAAAA0000A format
    pattern = re.compile(
        r"\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b",
        re.IGNORECASE,
    )
    validator = staticmethod(in_pan_valid)
