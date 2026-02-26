"""UK Unique Taxpayer Reference (UTR) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import uk_utr_checksum


@register_region("uk")
class UtrDetector(RegexDetector):
    entity_type = EntityType.UK_UTR
    score = 0.85
    context_keywords = [
        "utr", "unique taxpayer", "tax reference", "self assessment", "hmrc",
    ]
    context_required = True
    context_window = 50

    # 10-digit UTR number
    pattern = re.compile(
        r"\b\d{10}\b"
    )
    validator = staticmethod(uk_utr_checksum)
