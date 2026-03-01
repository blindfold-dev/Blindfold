"""UK NHS Number detector with modulus 11 checksum"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import nhs_checksum


@register_region("uk")
class NhsNumberDetector(RegexDetector):
    entity_type = EntityType.NHS_NUMBER
    score = 0.85
    context_keywords = ["nhs", "national health", "nhs number", "nhs#"]
    context_required = False
    context_window = 50

    # 10 digits with optional spaces
    pattern = re.compile(r"\b\d{3}\s?\d{3}\s?\d{4}\b")
    validator = staticmethod(nhs_checksum)
