"""Belgian National Number (Rijksregisternummer) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import be_national_number_checksum


@register_region("be")
class NationalNumberDetector(RegexDetector):
    entity_type = EntityType.BE_NATIONAL_NUMBER
    score = 0.85
    context_keywords = [
        "rijksregisternummer", "national number", "numero national",
        "registre national", "nn",
    ]
    context_required = True
    context_window = 50

    pattern = re.compile(
        r"\b\d{2}[. ]?\d{2}[. ]?\d{2}[- ]?\d{3}[. ]?\d{2}\b"
    )
    validator = staticmethod(be_national_number_checksum)
