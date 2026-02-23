"""US Driver's License detector (context-required, top state formats)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("us")
class DriversLicenseDetector(RegexDetector):
    entity_type = EntityType.DRIVERS_LICENSE
    score = 0.75
    context_keywords = [
        "driver", "license", "licence", "dl", "driver's license",
        "driving license", "dl#", "dl #",
    ]
    context_required = True
    context_window = 50

    # Top state formats: CA (1L+7D), NY (9D), TX (8D), FL (1L+12D), IL (1L+11D)
    pattern = re.compile(
        r"\b(?:"
        r"[A-Z]\d{7}"       # CA: A1234567
        r"|\d{9}"           # NY: 123456789
        r"|\d{8}"           # TX: 12345678
        r"|[A-Z]\d{12}"    # FL: A123456789012
        r"|[A-Z]\d{11}"    # IL: A12345678901
        r")\b"
    )
