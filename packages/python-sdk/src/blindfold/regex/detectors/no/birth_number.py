"""Norwegian Birth Number (Fodselsnummer) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import no_birth_number_checksum


@register_region("no")
class BirthNumberDetector(RegexDetector):
    entity_type = EntityType.NO_BIRTH_NUMBER
    score = 0.90
    context_keywords = [
        "fodselsnummer", "birth number", "personnummer",
        "f\u00f8dselsnummer",
    ]
    context_required = False
    context_window = 50

    # DDMMYY + 5 digits = 11 digits total
    pattern = re.compile(
        r"\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])\d{7}\b"
    )
    validator = staticmethod(no_birth_number_checksum)
