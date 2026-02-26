"""Croatian Personal Identification Number (OIB) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import hr_oib_checksum


@register_region("hr")
class OibDetector(RegexDetector):
    entity_type = EntityType.HR_OIB
    score = 0.85
    context_keywords = [
        "oib", "osobni identifikacijski broj", "personal identification",
        "identifikacijski",
    ]
    context_required = True
    context_window = 50

    # 11 digits
    pattern = re.compile(
        r"\b\d{11}\b"
    )
    validator = staticmethod(hr_oib_checksum)
