"""Date of birth detector (context-required)"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal

_MONTHS = (
    r"(?:january|february|march|april|may|june|july|august|"
    r"september|october|november|december|"
    r"jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)"
)


@register_universal
class DateOfBirthDetector(RegexDetector):
    entity_type = EntityType.DATE_OF_BIRTH
    score = 0.75
    context_keywords = [
        "born", "dob", "date of birth", "birthday", "birthdate", "d.o.b",
        "birth date",
    ]
    context_required = True
    context_window = 50

    # Multiple date formats
    pattern = re.compile(
        # MM/DD/YYYY or DD/MM/YYYY or MM-DD-YYYY
        r"\b(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.](?:19|20)\d{2}\b"
        r"|"
        # YYYY-MM-DD (ISO)
        r"\b(?:19|20)\d{2}[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])\b"
        r"|"
        # Month DD, YYYY
        r"\b" + _MONTHS + r"\s+\d{1,2},?\s+(?:19|20)\d{2}\b",
        re.IGNORECASE,
    )
