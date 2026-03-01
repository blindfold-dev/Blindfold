"""Russian SNILS (Insurance Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ru_snils_checksum


@register_region("ru")
class SnilsDetector(RegexDetector):
    entity_type = EntityType.RU_SNILS
    score = 0.85
    context_keywords = [
        "snils", "\u0441\u043d\u0438\u043b\u0441", "pension",
        "\u043f\u0435\u043d\u0441\u0438\u043e\u043d", "\u0441\u0442\u0440\u0430\u0445\u043e\u0432\u043e\u0435 \u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e",
    ]
    context_required = True
    context_window = 50

    # XXX-XXX-XXX XX format
    pattern = re.compile(
        r"\b\d{3}[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{2}\b"
    )
    validator = staticmethod(ru_snils_checksum)
