"""Indian Aadhaar Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import in_aadhaar_checksum


@register_region("in")
class InAadhaarDetector(RegexDetector):
    entity_type = EntityType.IN_AADHAAR
    score = 0.85
    context_keywords = [
        "aadhaar", "aadhar", "uidai", "unique identification",
    ]
    context_required = True
    context_window = 50

    # 12 digits starting with 2-9, with optional separators
    pattern = re.compile(
        r"\b[2-9]\d{3}[- ]?\d{4}[- ]?\d{4}\b"
    )
    validator = staticmethod(in_aadhaar_checksum)
