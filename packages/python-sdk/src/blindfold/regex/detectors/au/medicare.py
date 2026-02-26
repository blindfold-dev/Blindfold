"""Australian Medicare Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import au_medicare_checksum


@register_region("au")
class AuMedicareDetector(RegexDetector):
    entity_type = EntityType.AU_MEDICARE
    score = 0.85
    context_keywords = [
        "medicare", "medicare card", "medicare number",
    ]
    context_required = True
    context_window = 50

    # 10-11 digits: XXXX-XXXXX-X-X
    pattern = re.compile(
        r"\b\d{4}[- ]?\d{5}[- ]?\d[- ]?\d?\b"
    )
    validator = staticmethod(au_medicare_checksum)
