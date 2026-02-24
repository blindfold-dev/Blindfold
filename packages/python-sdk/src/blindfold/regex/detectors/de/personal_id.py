"""German Personal ID (Personalausweis) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("de")
class PersonalIdDetector(RegexDetector):
    entity_type = EntityType.DE_PERSONAL_ID
    score = 0.75
    context_keywords = [
        "personalausweis", "personal id", "ausweis", "identifikation",
        "id-nummer", "ausweisnummer",
    ]
    context_required = True
    context_window = 50

    # New German ID format: 1 letter + 1 alphanumeric + 7 digits + 1 check digit
    pattern = re.compile(
        r"\b[CFGHJKLMNPRTVWXYZ][0-9A-Z]\d{7}\d\b"
    )
