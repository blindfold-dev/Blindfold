"""Hungarian Social Security Number (TAJ) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import hu_taj_checksum


@register_region("hu")
class TajDetector(RegexDetector):
    entity_type = EntityType.HU_TAJ
    score = 0.85
    context_keywords = [
        "taj", "tarsadalombiztositasi", "social security",
        "társadalombiztosítási",
    ]
    context_required = True
    context_window = 50

    # 9 digits with optional separators
    pattern = re.compile(
        r"\b\d{3}[- ]?\d{3}[- ]?\d{3}\b"
    )
    validator = staticmethod(hu_taj_checksum)
