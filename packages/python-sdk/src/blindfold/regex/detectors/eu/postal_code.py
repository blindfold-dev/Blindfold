"""EU postal code detector (DE/FR/NL, context-required)"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("eu")
class EuPostalCodeDetector(RegexDetector):
    entity_type = EntityType.EU_POSTAL_CODE
    score = 0.70
    context_keywords = [
        "postal", "postcode", "post code", "zip", "plz", "postleitzahl",
        "code postal",
    ]
    context_required = True
    context_window = 50

    # DE: 5 digits | FR: 5 digits | NL: 4 digits + 2 letters
    pattern = re.compile(
        r"\b(?:"
        r"\d{5}"                 # DE, FR
        r"|\d{4}\s?[A-Z]{2}"    # NL
        r")\b"
    )
