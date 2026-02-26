"""Swiss AHV (Social Insurance Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ch_ahv_checksum


@register_region("ch")
class ChAhvDetector(RegexDetector):
    entity_type = EntityType.CH_AHV
    score = 0.85
    context_keywords = [
        "ahv", "avs", "oasi", "sozialversicherungsnummer", "ahv-nr",
    ]
    context_required = False
    context_window = 50

    # 756.XXXX.XXXX.XX format
    pattern = re.compile(
        r"\b756[. ]?\d{4}[. ]?\d{4}[. ]?\d{2}\b"
    )
    validator = staticmethod(ch_ahv_checksum)
