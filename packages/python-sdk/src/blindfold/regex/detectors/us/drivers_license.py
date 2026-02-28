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
        "driving license", "dl#", "dl #", "dmv", "permit",
    ]
    context_required = True
    context_window = 50

    # US state DL formats (ordered longest first to avoid partial matches)
    pattern = re.compile(
        r"\b(?:"
        r"[A-Z]\d{14}"      # NJ: A12345678901234
        r"|[A-Z]\d{13}"     # WI: A1234567890123
        r"|[A-Z]\d{12}"     # FL: A123456789012
        r"|[A-Z]\d{11}"     # IL: A12345678901
        r"|[A-Z]\d{10}"     # MI: A1234567890
        r"|[A-Z]\d{8}"      # MA/VA: A12345678
        r"|[A-Z]{2}\d{6}"   # OH: AB123456
        r"|[A-Z]\d{7}"      # CA: A1234567
        r"|\d{9}"           # NY: 123456789
        r"|\d{8}"           # TX/PA: 12345678
        r")\b"
    )
