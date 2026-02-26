"""Colombian NIT (Numero de Identificacion Tributaria) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import co_nit_checksum


@register_region("co")
class CoNitDetector(RegexDetector):
    entity_type = EntityType.CO_NIT
    score = 0.85
    context_keywords = [
        "nit", "numero de identificacion tributaria", "identificacion tributaria",
    ]
    context_required = True
    context_window = 50

    # XXX.XXX.XXX-X format
    pattern = re.compile(
        r"\b\d{3}\.?\d{3}\.?\d{3}-?\d\b"
    )
    validator = staticmethod(co_nit_checksum)
