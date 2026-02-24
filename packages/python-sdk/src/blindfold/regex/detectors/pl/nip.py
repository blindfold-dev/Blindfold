"""Polish NIP (Tax Identification Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import pl_nip_checksum


@register_region("pl")
class NipDetector(RegexDetector):
    entity_type = EntityType.PL_NIP
    score = 0.85
    context_keywords = [
        "nip", "tax", "podatkowy",
    ]
    context_required = True
    context_window = 50

    # 10 digits with optional separators
    pattern = re.compile(
        r"\b\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b"
    )
    validator = staticmethod(pl_nip_checksum)
