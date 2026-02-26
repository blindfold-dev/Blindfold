"""Slovak DIC (tax identification number) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import sk_dic_valid


@register_region("sk")
class DicDetector(RegexDetector):
    entity_type = EntityType.SK_DIC
    score = 0.85
    context_keywords = [
        "dic", "di\u010d", "danove identifikacne cislo",
        "da\u0148ov\u00e9 identifika\u010dn\u00e9 \u010d\u00edslo", "vat", "tax id",
    ]
    context_required = False
    context_window = 50

    # SK prefix + 10 digits
    pattern = re.compile(
        r"\bSK\d{10}\b",
        re.IGNORECASE,
    )
    validator = staticmethod(sk_dic_valid)
