"""Argentine CUIT (Clave Unica de Identificacion Tributaria) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import ar_cuit_checksum


@register_region("ar")
class ArCuitDetector(RegexDetector):
    entity_type = EntityType.AR_CUIT
    score = 0.85
    context_keywords = [
        "cuit", "cuil", "clave unica", "identificacion tributaria",
    ]
    context_required = True
    context_window = 50

    # XX-XXXXXXXX-X format
    pattern = re.compile(
        r"\b\d{2}-?\d{8}-?\d\b"
    )
    validator = staticmethod(ar_cuit_checksum)
