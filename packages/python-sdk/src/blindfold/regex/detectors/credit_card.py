"""Credit card number detector with Luhn validation"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal
from ..validators import luhn_checksum


@register_universal
class CreditCardDetector(RegexDetector):
    entity_type = EntityType.CREDIT_CARD
    score = 0.90
    pattern = re.compile(
        r"\b(?:"
        # Visa: 13, 16, or 19 digits
        r"4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}(?:[-\s]?\d{3})?"
        r"|4\d{12}"
        # Mastercard: 5[1-5]xx or 2[2-7]xx (16 digits)
        r"|5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"
        r"|2[2-7]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"
        # Amex: 34xx or 37xx (15 digits)
        r"|3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}"
        # Discover: 6011 or 65xx (16 digits)
        r"|6(?:011|5\d{2})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"
        # Diners Club: 300-305, 36, 38 (14 digits)
        r"|3(?:0[0-5]|[68]\d)\d{11}"
        # JCB: 3528-3589 (16 digits)
        r"|35(?:2[89]|[3-8]\d)\d{12}"
        # UnionPay: 62xx (16-19 digits)
        r"|62\d{14,17}"
        r")\b"
    )
    validator = staticmethod(luhn_checksum)

    def pre_check(self, text: str) -> bool:
        return any(c.isdigit() for c in text)
