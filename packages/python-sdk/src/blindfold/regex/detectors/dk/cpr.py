"""Danish CPR (Central Person Register) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import dk_cpr_valid_date


@register_region("dk")
class CprDetector(RegexDetector):
    entity_type = EntityType.DK_CPR
    score = 0.85
    context_keywords = [
        "cpr", "personnummer", "cpr-nummer", "central person",
    ]
    context_required = True
    context_window = 50

    # DDMMYY-XXXX format
    pattern = re.compile(
        r"\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{2}[-\s]?\d{4}\b"
    )
    validator = staticmethod(dk_cpr_valid_date)
