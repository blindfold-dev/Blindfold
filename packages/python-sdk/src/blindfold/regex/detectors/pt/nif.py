"""Portuguese NIF (Numero de Identificacao Fiscal) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import pt_nif_checksum


@register_region("pt")
class NifDetector(RegexDetector):
    entity_type = EntityType.PT_NIF
    score = 0.85
    context_keywords = [
        "nif", "contribuinte", "fiscal", "tax",
    ]
    context_required = True
    context_window = 50

    # 9 digits starting with 1, 2, 3, 5, 8, or 9
    pattern = re.compile(
        r"\b[1-3589]\d{8}\b"
    )
    validator = staticmethod(pt_nif_checksum)
