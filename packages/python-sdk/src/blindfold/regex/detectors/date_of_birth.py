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


def _valid_date(text: str) -> bool:
    """Basic plausibility check for date matches."""
    # Word-based dates (Month name present) are well-constrained by pattern
    if any(c.isalpha() and c not in "T" for c in text):
        return True
    # For numeric dates, ensure we have at least 3 digit groups
    groups = re.findall(r"\d+", text)
    return len(groups) >= 3


@register_universal
class DateOfBirthDetector(RegexDetector):
    entity_type = EntityType.DATE_OF_BIRTH
    score = 0.75
    context_keywords = [
        "born", "dob", "date of birth", "birthday", "birthdate", "d.o.b",
        "birth date", "birth", "b-day", "bday", "age", "d/o/b", "born on",
        "date de naissance", "geburtsdatum", "fecha de nacimiento",
        "geboortedatum", "data di nascita",
    ]
    context_required = True
    context_window = 100
    validator = staticmethod(_valid_date)

    # Multiple date formats
    pattern = re.compile(
        # MM/DD/YYYY (4-digit year, month 1-12)
        r"\b(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.](?:19|20)\d{2}\b"
        r"|"
        # DD/MM/YYYY (4-digit year, day 13-31 first — unambiguous DD/MM)
        r"\b(?:1[3-9]|2\d|3[01])[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:19|20)\d{2}\b"
        r"|"
        # MM/DD/YY (2-digit year, month 1-12)
        r"\b(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.]\d{2}\b"
        r"|"
        # DD/MM/YY (2-digit year, day 13-31 first)
        r"\b(?:1[3-9]|2\d|3[01])[/\-.](?:0?[1-9]|1[0-2])[/\-.]\d{2}\b"
        r"|"
        # YYYY-MM-DD (ISO, with optional T timestamp)
        r"\b(?:19|20)\d{2}[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])(?:T\d{2}:\d{2}:\d{2})?\b"
        r"|"
        # Month DDth, YYYY (with optional ordinal suffix)
        r"\b" + _MONTHS + r"\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:19|20)\d{2}\b"
        r"|"
        # DD Month YYYY (with optional ordinal suffix)
        r"\b\d{1,2}(?:st|nd|rd|th)?\s+" + _MONTHS + r",?\s+(?:19|20)\d{2}\b"
        r"|"
        # Month/YY (abbreviated — e.g., "May/58", "August/72")
        r"\b" + _MONTHS + r"[/\-.]\d{2}\b",
        re.IGNORECASE,
    )
