"""Italian Partita IVA (VAT number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import it_partita_iva_checksum


@register_region("it")
class PartitaIvaDetector(RegexDetector):
    entity_type = EntityType.IT_PARTITA_IVA
    score = 0.85
    context_keywords = [
        "partita iva", "p.iva", "p. iva", "vat", "iva",
    ]
    context_required = True
    context_window = 50

    # Optional IT prefix + 11 digits
    pattern = re.compile(
        r"\b(?:IT)?\d{11}\b",
        re.IGNORECASE,
    )
    validator = staticmethod(it_partita_iva_checksum)
