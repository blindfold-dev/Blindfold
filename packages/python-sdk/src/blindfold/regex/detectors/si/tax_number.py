"""Slovenian Tax Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import si_tax_number_checksum


@register_region("si")
class TaxNumberDetector(RegexDetector):
    entity_type = EntityType.SI_TAX_NUMBER
    score = 0.85
    context_keywords = [
        "davcna stevilka", "davcna", "tax number",
        "dav\u010dna \u0161tevilka",
    ]
    context_required = True
    context_window = 50

    # Optional SI prefix followed by 8 digits
    pattern = re.compile(
        r"\b(?:SI)?\d{8}\b", re.IGNORECASE
    )
    validator = staticmethod(si_tax_number_checksum)
