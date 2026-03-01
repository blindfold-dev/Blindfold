"""Romanian CNP (Cod Numeric Personal) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ro_cnp_checksum


@register_region("ro")
class CnpDetector(RegexDetector):
    entity_type = EntityType.RO_CNP
    score = 0.90
    context_keywords = [
        "cnp", "cod numeric personal", "personal numeric code",
    ]
    context_required = False
    context_window = 50

    # 13 digits starting with 1-8
    pattern = re.compile(
        r"\b[1-8]\d{12}\b"
    )
    validator = staticmethod(ro_cnp_checksum)
