"""Spanish CIF (Codigo de Identificacion Fiscal) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import es_cif_checksum


@register_region("es")
class CifDetector(RegexDetector):
    entity_type = EntityType.ES_CIF
    score = 0.85
    context_keywords = [
        "cif", "codigo de identificacion fiscal", "tax id", "nif empresa",
    ]
    context_required = False
    context_window = 50

    # Letter prefix + 7 digits + check digit/letter
    pattern = re.compile(
        r"\b[A-HJ-NP-SUVW]\d{7}[0-9A-J]\b",
        re.IGNORECASE,
    )
    validator = staticmethod(es_cif_checksum)
