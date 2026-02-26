"""South African ID Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import luhn_checksum


@register_region("za")
class ZaIdDetector(RegexDetector):
    entity_type = EntityType.ZA_ID
    score = 0.85
    context_keywords = [
        "id number", "identity number", "south african id", "sa id",
    ]
    context_required = True
    context_window = 50

    # 13 digits
    pattern = re.compile(
        r"\b\d{13}\b"
    )
    validator = staticmethod(luhn_checksum)
