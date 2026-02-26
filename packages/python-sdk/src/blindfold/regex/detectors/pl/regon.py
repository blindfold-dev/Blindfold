"""Polish REGON (statistical number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import pl_regon_checksum


@register_region("pl")
class RegonDetector(RegexDetector):
    entity_type = EntityType.PL_REGON
    score = 0.85
    context_keywords = [
        "regon", "statistical number", "numer statystyczny",
    ]
    context_required = True
    context_window = 50

    # 9 digits or 14 digits (9 + 5 extension)
    pattern = re.compile(
        r"\b\d{9}(?:\d{5})?\b"
    )
    validator = staticmethod(pl_regon_checksum)
