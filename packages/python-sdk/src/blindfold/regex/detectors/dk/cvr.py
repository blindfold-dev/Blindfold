"""Danish CVR (company registration number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import dk_cvr_checksum


@register_region("dk")
class CvrDetector(RegexDetector):
    entity_type = EntityType.DK_CVR
    score = 0.85
    context_keywords = [
        "cvr", "virksomhed", "erhvervsstyrelsen", "company number", "business id",
    ]
    context_required = True
    context_window = 50

    # Optional DK prefix + 8 digits
    pattern = re.compile(
        r"\b(?:DK)?\d{8}\b",
        re.IGNORECASE,
    )
    validator = staticmethod(dk_cvr_checksum)
