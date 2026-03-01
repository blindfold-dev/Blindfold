"""Slovenian Personal Identification Number (EMSO) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import si_emso_checksum


@register_region("si")
class EmsoDetector(RegexDetector):
    entity_type = EntityType.SI_EMSO
    score = 0.85
    context_keywords = [
        "emso", "enotna maticna stevilka", "maticna stevilka",
        "personal number",
    ]
    context_required = True
    context_window = 50

    # 13 digits
    pattern = re.compile(
        r"\b\d{13}\b"
    )
    validator = staticmethod(si_emso_checksum)
