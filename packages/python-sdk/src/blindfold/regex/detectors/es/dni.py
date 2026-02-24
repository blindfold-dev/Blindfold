"""Spanish DNI (Documento Nacional de Identidad) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import es_dni_letter


@register_region("es")
class DniDetector(RegexDetector):
    entity_type = EntityType.ES_DNI
    score = 0.90
    context_keywords = [
        "dni", "documento nacional", "identidad",
    ]
    context_required = False
    context_window = 50

    # 8 digits + letter
    pattern = re.compile(
        r"\b\d{8}[-\s]?[A-Z]\b",
        re.IGNORECASE,
    )
    validator = staticmethod(es_dni_letter)
