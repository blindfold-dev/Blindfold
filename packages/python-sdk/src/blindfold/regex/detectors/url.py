"""URL detector"""

import re

from ..base import RegexDetector
from ..entities import EntityType
from ..registry import register_universal

# Common TLDs — covers ~99% of real-world URLs
_VALID_TLDS = frozenset({
    "com", "org", "net", "edu", "gov", "mil", "int",
    "io", "co", "dev", "app", "ai", "me", "us", "uk", "de", "fr", "it",
    "es", "nl", "be", "at", "ch", "se", "no", "dk", "fi", "pl", "cz",
    "sk", "pt", "ru", "br", "jp", "kr", "cn", "in", "au", "nz", "za",
    "ca", "mx", "ar", "cl", "il", "tr", "ie", "hu", "ro", "bg", "hr",
    "si", "lt", "lv", "ee", "info", "biz", "name", "pro", "xyz", "online",
    "site", "tech", "store", "shop", "cloud", "page", "link", "top",
    "icu", "live", "world", "blog", "news", "tv", "cc", "ly", "gg",
    "to", "eu", "asia",
})


def _url_valid_tld(text: str) -> bool:
    """Check that the URL has a recognized TLD."""
    # Extract the domain part (between :// and first / or end)
    try:
        after_scheme = text.split("://", 1)[1]
        domain = after_scheme.split("/", 1)[0].split("?", 1)[0].split("#", 1)[0]
        # Get TLD (last part after final dot)
        parts = domain.rstrip(".").split(".")
        if len(parts) < 2:
            return False
        tld = parts[-1].lower()
        return tld in _VALID_TLDS
    except (IndexError, ValueError):
        return False


@register_universal
class UrlDetector(RegexDetector):
    entity_type = EntityType.URL
    score = 0.85
    pattern = re.compile(
        r"https?://"
        r"(?:[\w\-]+\.)+[a-zA-Z]{2,}"
        r"(?:/[^\s<>\"')\]]*)?",
        re.IGNORECASE,
    )
    validator = staticmethod(_url_valid_tld)

    def pre_check(self, text: str) -> bool:
        return "://" in text
