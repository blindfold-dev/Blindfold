"""Finnish Personal Identity Code (HETU) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import fi_hetu_checksum


@register_region("fi")
class HetuDetector(RegexDetector):
    entity_type = EntityType.FI_HETU
    score = 0.85
    context_keywords = [
        "henkilotunnus", "hetu", "personal identity code",
        "sosiaaliturvatunnus",
    ]
    context_required = False
    context_window = 50

    # DDMMYY + separator + 3 digits + check character
    pattern = re.compile(
        r"\b\d{6}[-+ABCDEFYXWVUabcdefyxwvu]\d{3}[0-9A-Za-z]\b"
    )
    validator = staticmethod(fi_hetu_checksum)
