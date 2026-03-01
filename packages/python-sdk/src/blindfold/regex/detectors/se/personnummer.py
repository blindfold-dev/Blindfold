"""Swedish Personnummer detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import se_personnummer_luhn


@register_region("se")
class PersonnummerDetector(RegexDetector):
    entity_type = EntityType.SE_PERSONNUMMER
    score = 0.90
    context_keywords = [
        "personnummer", "personal number", "pnr",
    ]
    context_required = False
    context_window = 50

    # YYYYMMDD-XXXX or YYMMDD-XXXX
    pattern = re.compile(
        r"\b(?:\d{8}|\d{6})[-+]?\d{4}\b"
    )
    validator = staticmethod(se_personnummer_luhn)
