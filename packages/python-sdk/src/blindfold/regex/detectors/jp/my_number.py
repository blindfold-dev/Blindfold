"""Japanese My Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import jp_my_number_checksum


@register_region("jp")
class JpMyNumberDetector(RegexDetector):
    entity_type = EntityType.JP_MY_NUMBER
    score = 0.85
    context_keywords = [
        "my number", "\u30de\u30a4\u30ca\u30f3\u30d0\u30fc", "kojin bango", "individual number",
    ]
    context_required = True
    context_window = 50

    # 12 digits with optional separators
    pattern = re.compile(
        r"\b\d{4}[- ]?\d{4}[- ]?\d{4}\b"
    )
    validator = staticmethod(jp_my_number_checksum)
