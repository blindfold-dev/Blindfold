"""Austrian Social Insurance Number (SVNR) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import at_svnr_checksum


@register_region("at")
class SvnrDetector(RegexDetector):
    entity_type = EntityType.AT_SVNR
    score = 0.85
    context_keywords = [
        "svnr", "sozialversicherungsnummer", "versicherungsnummer",
        "social insurance",
    ]
    context_required = True
    context_window = 50

    pattern = re.compile(
        r"\b\d{4}[- ]?\d{6}\b"
    )
    validator = staticmethod(at_svnr_checksum)
