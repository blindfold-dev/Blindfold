"""Credit card number detector with Luhn validation"""

import re
from typing import List

from ..base import RegexDetector
from ..entities import EntityType, PIIMatch
from ..registry import register_universal
from ..validators import luhn_checksum

# Known IIN prefix patterns (no context needed)
_CC_KNOWN = re.compile(
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
    # Diners Club: 300-305, 36, 38 (14-16 digits)
    r"|3(?:0[0-5]|[68]\d)\d{11,13}"
    # JCB: 3528-3589 (16 digits)
    r"|35(?:2[89]|[3-8]\d)\d{12}"
    # UnionPay: 62xx (16-19 digits)
    r"|62\d{14,17}"
    # Maestro: 5018, 5020, 5038, 6304, 6759, 6761-6763 (12-19 digits)
    r"|50(?:18|20|38)\d{8,15}"
    r"|6(?:304|7(?:59|6[1-3]))\d{8,15}"
    r")\b"
)

# Generic long number pattern (context required, for unknown IIN prefixes)
_CC_GENERIC = re.compile(
    r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b"
)

_CC_CONTEXT = [
    "credit card", "card number", "card no", "card #",
    "cc:", "cc #", "payment card", "debit card",
    "billing", "card:", "credit", "payment",
]


@register_universal
class CreditCardDetector(RegexDetector):
    entity_type = EntityType.CREDIT_CARD
    score = 0.90
    # Use known pattern as primary (base class uses this for pre_check)
    pattern = _CC_KNOWN
    validator = staticmethod(luhn_checksum)

    def pre_check(self, text: str) -> bool:
        return any(c.isdigit() for c in text)

    def iter_matches(self, text: str) -> List[PIIMatch]:
        if not self.pre_check(text):
            return []

        results: List[PIIMatch] = []

        # Branch 1: Known IIN prefixes (no context needed)
        for match in _CC_KNOWN.finditer(text):
            matched_text = match.group()
            if not luhn_checksum(matched_text):
                continue
            results.append(PIIMatch(
                entity_type=self.entity_type.value,
                text=matched_text,
                start=match.start(),
                end=match.end(),
                score=1.0,
            ))

        # Branch 2: Generic long numbers with context + Luhn (unknown IIN)
        for match in _CC_GENERIC.finditer(text):
            matched_text = match.group()
            start = match.start()
            # Skip if overlaps with known pattern match
            if any(r.start <= start < r.end for r in results):
                continue
            if not luhn_checksum(matched_text):
                continue
            # Require CC context keywords
            window_start = max(0, start - 100)
            lower = getattr(self, '_text_lower', None) or text.lower()
            window = lower[window_start:start]
            if not any(kw in window for kw in _CC_CONTEXT):
                continue
            results.append(PIIMatch(
                entity_type=self.entity_type.value,
                text=matched_text,
                start=start,
                end=match.end(),
                score=1.0,
            ))

        return results
