"""South Korean RRN (Resident Registration Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import kr_rrn_checksum


@register_region("kr")
class KrRrnDetector(RegexDetector):
    entity_type = EntityType.KR_RRN
    score = 0.85
    context_keywords = [
        "\uc8fc\ubbfc\ub4f1\ub85d\ubc88\ud638", "resident registration", "jumin", "rrn",
    ]
    context_required = True
    context_window = 50

    # 13 digits: YYMMDD-NNNNNNN
    pattern = re.compile(
        r"\b\d{6}[- ]?\d{7}\b"
    )
    validator = staticmethod(kr_rrn_checksum)
