"""German Tax ID (Steueridentifikationsnummer) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import de_tax_id_checksum


@register_region("de")
class TaxIdDetector(RegexDetector):
    entity_type = EntityType.DE_TAX_ID
    score = 0.85
    context_keywords = [
        "steuer", "tax id", "steueridentifikationsnummer", "tin",
        "identifikationsnummer", "steuernummer",
    ]
    context_required = False
    context_window = 50

    # 11 digits with optional spaces
    pattern = re.compile(
        r"\b\d{2}\s?\d{3}\s?\d{3}\s?\d{3}\b"
    )
    validator = staticmethod(de_tax_id_checksum)
