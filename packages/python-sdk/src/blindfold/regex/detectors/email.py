"""Email address detector"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal


@register_universal
class EmailDetector(RegexDetector):
    entity_type = EntityType.EMAIL_ADDRESS
    score = 0.95
    needs_digit = False
    pattern = re.compile(
        r"\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b"
    )

    def pre_check(self, text: str) -> bool:
        return "@" in text
