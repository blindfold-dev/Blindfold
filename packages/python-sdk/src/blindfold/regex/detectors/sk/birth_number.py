"""Slovak Birth Number (Rodne cislo) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import sk_birth_number_valid


@register_region("sk")
class BirthNumberDetector(RegexDetector):
    entity_type = EntityType.SK_BIRTH_NUMBER
    score = 0.85
    context_keywords = [
        "rodne cislo", "birth number", "rc", "rodn\u00e9 \u010d\u00edslo",
    ]
    context_required = True
    context_window = 50

    # 6 digits, optional /, 3-4 digits
    pattern = re.compile(
        r"\b\d{6}/?\d{3,4}\b"
    )
    validator = staticmethod(sk_birth_number_valid)
