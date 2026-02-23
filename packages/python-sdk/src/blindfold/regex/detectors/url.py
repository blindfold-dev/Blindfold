"""URL detector"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal


@register_universal
class UrlDetector(RegexDetector):
    entity_type = EntityType.URL
    score = 0.95
    pattern = re.compile(
        r"https?://"
        r"(?:[\w\-]+\.)+[a-zA-Z]{2,}"
        r"(?:/[^\s<>\"']*)?",
        re.IGNORECASE,
    )

    def pre_check(self, text: str) -> bool:
        return "://" in text
