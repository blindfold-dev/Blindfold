"""Canadian SIN (Social Insurance Number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import luhn_checksum


@register_region("ca")
class CaSinDetector(RegexDetector):
    entity_type = EntityType.CA_SIN
    score = 0.85
    context_keywords = [
        "sin", "social insurance number", "numero assurance sociale", "nas",
    ]
    context_required = True
    context_window = 50

    # XXX-XXX-XXX or plain 9 digits
    pattern = re.compile(
        r"\b\d{3}[- ]?\d{3}[- ]?\d{3}\b"
    )
    validator = staticmethod(luhn_checksum)
