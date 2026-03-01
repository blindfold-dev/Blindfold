"""Russian INN (Taxpayer Identification Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ru_inn_checksum


@register_region("ru")
class InnDetector(RegexDetector):
    entity_type = EntityType.RU_INN
    score = 0.85
    context_keywords = [
        "inn", "\u0438\u043d\u043d", "taxpayer", "\u043d\u0430\u043b\u043e\u0433",
    ]
    context_required = True
    context_window = 50

    # 10 or 12 digits
    pattern = re.compile(
        r"\b\d{10}\b|\b\d{12}\b"
    )
    validator = staticmethod(ru_inn_checksum)
