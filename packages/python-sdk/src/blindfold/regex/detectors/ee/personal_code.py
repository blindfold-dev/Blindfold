"""Estonian Personal Code (Isikukood) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ee_personal_code_checksum


@register_region("ee")
class PersonalCodeDetector(RegexDetector):
    entity_type = EntityType.EE_PERSONAL_CODE
    score = 0.85
    context_keywords = [
        "isikukood", "personal code", "identity code",
    ]
    context_required = True
    context_window = 50

    # Gender digit (1-6) followed by 10 digits
    pattern = re.compile(
        r"\b[1-6]\d{10}\b"
    )
    validator = staticmethod(ee_personal_code_checksum)
