"""Czech DIC (Tax/VAT ID) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import cz_dic_valid


@register_region("cz")
class DicDetector(RegexDetector):
    entity_type = EntityType.CZ_DIC
    score = 0.85
    context_keywords = [
        "dic", "di\u010d", "danove identifikacni cislo",
        "da\u0148ov\u00e9 identifika\u010dn\u00ed \u010d\u00edslo", "vat", "tax id",
    ]
    context_required = False
    context_window = 50

    pattern = re.compile(r"\bCZ\d{8,10}\b", re.IGNORECASE)
    validator = staticmethod(cz_dic_valid)
