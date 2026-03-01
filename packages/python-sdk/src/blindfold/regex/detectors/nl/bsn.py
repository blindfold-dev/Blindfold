"""Dutch BSN (Burgerservicenummer) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import nl_bsn_11test


@register_region("nl")
class BsnDetector(RegexDetector):
    entity_type = EntityType.NL_BSN
    score = 0.85
    context_keywords = [
        "bsn", "burgerservicenummer", "sofi", "citizen service",
    ]
    context_required = True
    context_window = 50

    # 9 digits
    pattern = re.compile(
        r"\b\d{9}\b"
    )
    validator = staticmethod(nl_bsn_11test)
