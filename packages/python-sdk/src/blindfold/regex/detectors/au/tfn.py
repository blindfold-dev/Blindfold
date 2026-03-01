"""Australian TFN (Tax File Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import au_tfn_checksum


@register_region("au")
class AuTfnDetector(RegexDetector):
    entity_type = EntityType.AU_TFN
    score = 0.85
    context_keywords = [
        "tfn", "tax file number", "tax file no",
    ]
    context_required = True
    context_window = 50

    # 8 or 9 digits with optional separators
    pattern = re.compile(
        r"\b\d{3}[- ]?\d{3}[- ]?\d{2,3}\b"
    )
    validator = staticmethod(au_tfn_checksum)
