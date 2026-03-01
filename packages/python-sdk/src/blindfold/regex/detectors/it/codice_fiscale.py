"""Italian Codice Fiscale detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import it_codice_fiscale_check


@register_region("it")
class CodiceFiscaleDetector(RegexDetector):
    entity_type = EntityType.IT_CODICE_FISCALE
    score = 0.90
    context_keywords = [
        "codice fiscale", "cf", "fiscal code",
    ]
    context_required = False
    context_window = 50

    # 6 letters + 2 digits + 1 letter + 2 digits + 1 letter + 3 digits + 1 letter
    pattern = re.compile(
        r"\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b",
        re.IGNORECASE,
    )
    validator = staticmethod(it_codice_fiscale_check)
