"""Slovak ICO (company identification number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import sk_ico_checksum


@register_region("sk")
class IcoDetector(RegexDetector):
    entity_type = EntityType.SK_ICO
    score = 0.85
    context_keywords = [
        "ico", "\u00ed\u010do", "identifikacne cislo",
        "identifika\u010dn\u00e9 \u010d\u00edslo", "company id", "business id",
    ]
    context_required = True
    context_window = 50

    # 8-digit company ID
    pattern = re.compile(
        r"\b\d{8}\b"
    )
    validator = staticmethod(sk_ico_checksum)
