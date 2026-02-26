"""Bulgarian Personal Number (EGN) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import bg_egn_checksum


@register_region("bg")
class EgnDetector(RegexDetector):
    entity_type = EntityType.BG_EGN
    score = 0.85
    context_keywords = [
        "egn", "\u0435\u0433\u043d", "edinen grazhdanski nomer", "personal number",
        "civil number",
    ]
    context_required = True
    context_window = 50

    # 10 digits
    pattern = re.compile(
        r"\b\d{10}\b"
    )
    validator = staticmethod(bg_egn_checksum)
