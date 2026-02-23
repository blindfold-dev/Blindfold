"""IBAN detector with mod-97 checksum validation"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import iban_mod97


@register_region("eu")
class IbanDetector(RegexDetector):
    entity_type = EntityType.IBAN
    score = 0.90
    # IBAN: 2 letter country code + 2 check digits + up to 30 alphanumeric chars
    pattern = re.compile(
        r"\b[A-Z]{2}\d{2}\s?[\dA-Z]{4}(?:\s?[\dA-Z]{4}){1,7}(?:\s?[\dA-Z]{1,4})?\b"
    )
    validator = staticmethod(iban_mod97)
