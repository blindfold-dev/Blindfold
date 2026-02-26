"""Spanish Social Security Number (NSS) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import es_nss_checksum


@register_region("es")
class NssDetector(RegexDetector):
    entity_type = EntityType.ES_NSS
    score = 0.85
    context_keywords = [
        "nss", "numero seguridad social", "seguridad social", "social security",
    ]
    context_required = True
    context_window = 50

    # 2 digits (province) + 8 digits (number) + 2 digits (check)
    pattern = re.compile(
        r"\b\d{2}[- ]?\d{8}[- ]?\d{2}\b"
    )
    validator = staticmethod(es_nss_checksum)
