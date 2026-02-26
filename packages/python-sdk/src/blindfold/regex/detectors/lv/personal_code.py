"""Latvian Personal Code (Personas kods) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import lv_personal_code_checksum


@register_region("lv")
class PersonalCodeDetector(RegexDetector):
    entity_type = EntityType.LV_PERSONAL_CODE
    score = 0.85
    context_keywords = [
        "personas kods", "personal code", "personas",
    ]
    context_required = True
    context_window = 50

    # 6 digits + optional hyphen + 5 digits
    pattern = re.compile(
        r"\b\d{6}-?\d{5}\b"
    )
    validator = staticmethod(lv_personal_code_checksum)
