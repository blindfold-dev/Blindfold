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
    # Visa, Mastercard, Amex, Discover with optional separators
    pattern = re.compile(
        r"\b(?:"
        r"4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"  # Visa
        r"|5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"  # Mastercard
        r"|3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}"  # Amex
        r"|6(?:011|5\d{2})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"  # Discover
        r")\b"
    )
    validator = staticmethod(luhn_checksum)
