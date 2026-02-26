"""Hungarian Tax ID detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import hu_tax_id_checksum


@register_region("hu")
class TaxIdDetector(RegexDetector):
    entity_type = EntityType.HU_TAX_ID
    score = 0.85
    context_keywords = [
        "adoazonosito", "adószám", "tax id", "tax number",
        "adoazonosito jel",
    ]
    context_required = True
    context_window = 50

    # Starts with 8, followed by 9 digits
    pattern = re.compile(
        r"\b8\d{9}\b"
    )
    validator = staticmethod(hu_tax_id_checksum)
