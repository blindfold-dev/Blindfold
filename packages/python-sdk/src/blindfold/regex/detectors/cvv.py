"""CVV/CVC detector (always context-required)"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal


@register_universal
class CvvDetector(RegexDetector):
    entity_type = EntityType.CVV
    score = 0.80
    context_keywords = [
        "cvv", "cvc", "security code", "card verification", "cvv2", "cvc2",
        "csv",
    ]
    context_required = True
    context_window = 50

    pattern = re.compile(r"\b\d{3,4}\b")
