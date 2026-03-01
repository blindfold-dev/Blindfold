"""New Zealand IRD (Inland Revenue Department) Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import nz_ird_checksum


@register_region("nz")
class NzIrdDetector(RegexDetector):
    entity_type = EntityType.NZ_IRD
    score = 0.85
    context_keywords = [
        "ird", "inland revenue", "tax number", "ird number",
    ]
    context_required = True
    context_window = 50

    # 8-9 digits with optional separators
    pattern = re.compile(
        r"\b\d{2,3}[- ]?\d{3}[- ]?\d{3}\b"
    )
    validator = staticmethod(nz_ird_checksum)
