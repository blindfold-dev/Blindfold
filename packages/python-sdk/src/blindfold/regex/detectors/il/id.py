"""Israeli ID Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import luhn_checksum


@register_region("il")
class IlIdDetector(RegexDetector):
    entity_type = EntityType.IL_ID
    score = 0.85
    context_keywords = [
        "teudat zehut", "mispar zehut", "identity number",
        "\u05ea.\u05d6", "tz",
    ]
    context_required = True
    context_window = 50

    # 9 digits
    pattern = re.compile(
        r"\b\d{9}\b"
    )
    validator = staticmethod(luhn_checksum)
