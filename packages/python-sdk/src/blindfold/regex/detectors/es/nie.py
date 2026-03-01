"""Spanish NIE (Numero de Identidad de Extranjero) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import es_nie_letter


@register_region("es")
class NieDetector(RegexDetector):
    entity_type = EntityType.ES_NIE
    score = 0.90
    context_keywords = [
        "nie", "extranjero", "numero de identidad",
    ]
    context_required = False
    context_window = 50

    # X/Y/Z + 7 digits + letter
    pattern = re.compile(
        r"\b[XYZ]\d{7}[-\s]?[A-Z]\b",
        re.IGNORECASE,
    )
    validator = staticmethod(es_nie_letter)
