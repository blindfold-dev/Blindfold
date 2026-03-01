"""MAC address detector"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal


@register_universal
class MacAddressDetector(RegexDetector):
    entity_type = EntityType.MAC_ADDRESS
    score = 0.95
    # Standard MAC formats: AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF
    pattern = re.compile(
        r"\b(?:[0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}\b"
    )
