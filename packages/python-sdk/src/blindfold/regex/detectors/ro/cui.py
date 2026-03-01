"""Romanian CUI (company identification number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ro_cui_checksum


@register_region("ro")
class CuiDetector(RegexDetector):
    entity_type = EntityType.RO_CUI
    score = 0.85
    context_keywords = [
        "cui", "cod unic", "cod de inregistrare", "fiscal code", "cif",
    ]
    context_required = True
    context_window = 50

    # Optional RO prefix + 2-10 digits
    pattern = re.compile(
        r"\b(?:RO)?\d{2,10}\b",
        re.IGNORECASE,
    )
    validator = staticmethod(ro_cui_checksum)
