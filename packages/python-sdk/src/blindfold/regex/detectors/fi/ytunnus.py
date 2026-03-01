"""Finnish Business ID (Y-tunnus) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import fi_ytunnus_checksum


@register_region("fi")
class YtunnusDetector(RegexDetector):
    entity_type = EntityType.FI_YTUNNUS
    score = 0.85
    context_keywords = [
        "y-tunnus", "ytunnus", "business id", "yritystunnus", "fo-nummer",
    ]
    context_required = True
    context_window = 50

    # 7 digits + hyphen + check digit
    pattern = re.compile(
        r"\b\d{7}-\d\b"
    )
    validator = staticmethod(fi_ytunnus_checksum)
