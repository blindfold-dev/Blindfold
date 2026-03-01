"""Turkish Kimlik (National ID) Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import tr_kimlik_checksum


@register_region("tr")
class TrKimlikDetector(RegexDetector):
    entity_type = EntityType.TR_KIMLIK
    score = 0.85
    context_keywords = [
        "tc kimlik", "kimlik no", "tckn", "vatandas", "nufus",
    ]
    context_required = True
    context_window = 50

    # 11 digits, first digit non-zero
    pattern = re.compile(
        r"\b[1-9]\d{10}\b"
    )
    validator = staticmethod(tr_kimlik_checksum)
