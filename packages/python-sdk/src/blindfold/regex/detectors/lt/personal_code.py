"""Lithuanian Personal Code (Asmens kodas) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import lt_personal_code_checksum


@register_region("lt")
class PersonalCodeDetector(RegexDetector):
    entity_type = EntityType.LT_PERSONAL_CODE
    score = 0.85
    context_keywords = [
        "asmens kodas", "personal code", "asmens",
    ]
    context_required = True
    context_window = 50

    # Gender digit (1-6) followed by 10 digits
    pattern = re.compile(
        r"\b[1-6]\d{10}\b"
    )
    validator = staticmethod(lt_personal_code_checksum)
