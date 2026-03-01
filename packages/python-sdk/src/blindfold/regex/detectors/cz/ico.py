"""Czech ICO (Company ID) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import cz_ico_checksum


@register_region("cz")
class IcoDetector(RegexDetector):
    entity_type = EntityType.CZ_ICO
    score = 0.85
    context_keywords = [
        "ico", "i\u010do", "identifikacni cislo",
        "identifika\u010dn\u00ed \u010d\u00edslo", "company id", "business id",
    ]
    context_required = True
    context_window = 50

    pattern = re.compile(r"\b\d{8}\b")
    validator = staticmethod(cz_ico_checksum)
