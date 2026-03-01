"""Norwegian Organisasjonsnummer (organization number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import no_orgnr_checksum


@register_region("no")
class OrgnrDetector(RegexDetector):
    entity_type = EntityType.NO_ORGNR
    score = 0.85
    context_keywords = [
        "organisasjonsnummer", "orgnr", "org nr", "organization number",
        "foretaksnummer",
    ]
    context_required = True
    context_window = 50

    # 9-digit organization number
    pattern = re.compile(
        r"\b\d{9}\b"
    )
    validator = staticmethod(no_orgnr_checksum)
