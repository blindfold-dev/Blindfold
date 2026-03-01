"""US Tax ID / EIN detector (context-required)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("us")
class TaxIdDetector(RegexDetector):
    entity_type = EntityType.TAX_ID
    score = 0.80
    context_keywords = [
        "ein", "tax id", "tax identification", "employer identification",
        "tin", "tax #", "ein#",
    ]
    context_required = True
    context_window = 50

    # EIN format: XX-XXXXXXX (first two digits are valid prefixes)
    pattern = re.compile(r"\b\d{2}-\d{7}\b")
