"""Phone number detector (NANP + international + EU trunk formats)"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal

_DATE_LIKE = re.compile(r"^\d{1,2}[-./]\d{1,2}[-./]\d{2,4}$")
_SSN_LIKE = re.compile(r"^\d{3}[-.\s]\d{2}[-.\s]\d{4}$")


def _phone_length_check(text: str) -> bool:
    """Validate that the digit count is within phone number range (7-15)."""
    digits = sum(1 for c in text if c.isdigit())
    if not (7 <= digits <= 15):
        return False
    # Reject date-like patterns (e.g., 03-15-1990) to avoid stealing DOB matches
    if _DATE_LIKE.match(text):
        return False
    # Reject SSN-like patterns (e.g., 044-10-7757) to avoid stealing SSN matches
    if _SSN_LIKE.match(text):
        return False
    return True


@register_universal
class PhoneDetector(RegexDetector):
    entity_type = EntityType.PHONE_NUMBER
    score = 0.85
    context_keywords = [
        "phone", "tel", "telephone", "call", "mobile", "cell", "fax",
        "contact", "dial", "reach", "ring", "text", "sms", "whatsapp",
        "number", "ph#", "ph #", "cell#", "cell #",
    ]
    context_window = 80
    pattern = re.compile(
        r"(?<!\d)"
        r"(?:"
        # NANP with parens: separator optional after closing paren
        r"(?:\+?1[-.\s]?)?\([2-9]\d{2}\)[-.\s]?[2-9]\d{2}[-.\s]?\d{4}"
        r"|"
        # NANP without parens: first separator required
        r"(?:\+?1[-.\s]?)?[2-9]\d{2}[-.\s][2-9]\d{2}[-.\s]?\d{4}"
        r"|"
        # International: +CC with optional separator after country code
        r"\+[1-9]\d{0,2}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}"
        r"|"
        # EU trunk prefix: 0XX followed by 7-11 digits with separators
        r"0\d{1,3}[-.\s]\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{0,4}"
        r")"
        # Optional extension
        r"(?:\s?(?:x|ext\.?)\s?\d{1,5})?"
        r"(?!\d)"
    )
    validator = staticmethod(_phone_length_check)
