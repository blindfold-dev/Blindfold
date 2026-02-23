"""US Passport number detector (context-required)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("us")
class UsPassportDetector(RegexDetector):
    entity_type = EntityType.US_PASSPORT
    score = 0.75
    context_keywords = [
        "passport", "passport#", "passport #", "passport number",
        "passport no",
    ]
    context_required = True
    context_window = 50

    # US passport: 9 digits
    pattern = re.compile(r"\b\d{9}\b")
