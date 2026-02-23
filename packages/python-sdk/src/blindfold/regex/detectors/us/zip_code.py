"""US ZIP Code detector (context-required)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("us")
class ZipCodeDetector(RegexDetector):
    entity_type = EntityType.ZIP_CODE
    score = 0.70
    context_keywords = [
        "zip", "postal", "zip code", "zipcode", "postal code",
    ]
    context_required = True
    context_window = 50

    # 5 digits or 5+4 format
    pattern = re.compile(r"\b\d{5}(?:-\d{4})?\b")
