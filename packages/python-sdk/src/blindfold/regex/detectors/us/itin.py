"""US Individual Taxpayer Identification Number (ITIN) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import us_itin_valid


@register_region("us")
class ItinDetector(RegexDetector):
    entity_type = EntityType.US_ITIN
    score = 0.85
    context_keywords = [
        "itin", "individual taxpayer", "tax identification",
    ]
    context_required = True
    context_window = 50

    # ITIN: starts with 9, then 2 digits, separator, 2 digits, separator, 4 digits
    pattern = re.compile(
        r"\b9\d{2}[- ]?\d{2}[- ]?\d{4}\b"
    )
    validator = staticmethod(us_itin_valid)
