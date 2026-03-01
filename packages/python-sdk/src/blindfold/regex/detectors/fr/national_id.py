"""French National ID (NIR / INSEE) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import fr_nir_checksum


@register_region("fr")
class NationalIdDetector(RegexDetector):
    entity_type = EntityType.FR_NATIONAL_ID
    score = 0.90
    context_keywords = [
        "nir", "securite sociale", "social security", "numero national",
        "insee",
    ]
    context_required = False
    context_window = 50

    # 15 digits: gender + YY + MM + dept + commune + order + key
    pattern = re.compile(
        r"\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2]|[2-9]\d)"
        r"\s?\d{2,3}\s?\d{3}\s?\d{3}\s?\d{2}\b"
    )
    validator = staticmethod(fr_nir_checksum)
