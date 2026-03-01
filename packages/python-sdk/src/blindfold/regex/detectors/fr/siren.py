"""French SIREN (company identification) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import luhn_checksum


@register_region("fr")
class SirenDetector(RegexDetector):
    entity_type = EntityType.FR_SIREN
    score = 0.85
    context_keywords = [
        "siren", "siret", "registre du commerce", "rcs", "company number",
    ]
    context_required = True
    context_window = 50

    # 9 digits in groups of 3
    pattern = re.compile(
        r"\b\d{3}[- ]?\d{3}[- ]?\d{3}\b"
    )
    validator = staticmethod(luhn_checksum)
