"""Irish Personal Public Service (PPS) Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ie_pps_checksum


@register_region("ie")
class PpsDetector(RegexDetector):
    entity_type = EntityType.IE_PPS
    score = 0.85
    context_keywords = [
        "pps", "ppsn", "personal public service", "revenue",
    ]
    context_required = False
    context_window = 50

    pattern = re.compile(
        r"\b\d{7}[A-Z]{1,2}\b"
    )
    validator = staticmethod(ie_pps_checksum)
