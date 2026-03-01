"""Swedish Organisationsnummer (organization number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import se_orgnr_checksum


@register_region("se")
class OrgnrDetector(RegexDetector):
    entity_type = EntityType.SE_ORGNR
    score = 0.85
    context_keywords = [
        "organisationsnummer", "orgnr", "org nr", "organization number", "foretag",
    ]
    context_required = True
    context_window = 50

    # 6 digits + optional hyphen + 4 digits
    pattern = re.compile(
        r"\b\d{6}-?\d{4}\b"
    )
    validator = staticmethod(se_orgnr_checksum)
