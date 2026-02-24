"""Polish PESEL detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import pl_pesel_checksum


@register_region("pl")
class PeselDetector(RegexDetector):
    entity_type = EntityType.PL_PESEL
    score = 0.85
    context_keywords = [
        "pesel",
    ]
    context_required = False
    context_window = 50

    # 11 digits
    pattern = re.compile(
        r"\b\d{11}\b"
    )
    validator = staticmethod(pl_pesel_checksum)
