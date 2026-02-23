"""Phone number detector (NANP + international formats)"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal


@register_universal
class PhoneDetector(RegexDetector):
    entity_type = EntityType.PHONE_NUMBER
    score = 0.85
    # NANP (US/CA) and international formats
    pattern = re.compile(
        r"(?<!\d)"  # Negative lookbehind: no digit before
        r"(?:"
        # NANP: optional +1, area code, exchange, subscriber
        r"(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s][2-9]\d{2}[-.\s]\d{4}"
        r"|"
        # International: +CC with separators
        r"\+[1-9]\d{0,2}[-.\s]\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}"
        r")"
        r"(?!\d)"  # Negative lookahead: no digit after
    )
