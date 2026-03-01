"""US ZIP Code detector (context-required)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


def _zip_valid(text: str) -> bool:
    """Reject ZIPs starting with 000 (no valid US ZIP starts with 000)."""
    digits = "".join(c for c in text if c.isdigit())
    return not digits.startswith("000")


@register_region("us")
class ZipCodeDetector(RegexDetector):
    entity_type = EntityType.ZIP_CODE
    score = 0.70
    context_keywords = [
        "zip", "postal", "zip code", "zipcode", "postal code",
        "address", "city", "state", "mailing", "shipping",
        "billing", "delivery", "location", "resident", "zip+4",
        "usa", "united states",
    ]
    context_required = True
    context_window = 150

    # 5 digits or 5+4 format
    pattern = re.compile(r"\b\d{5}(?:-\d{4})?\b")
    validator = staticmethod(_zip_valid)
