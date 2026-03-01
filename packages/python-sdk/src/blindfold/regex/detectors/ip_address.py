"""IP address detector (IPv4 and IPv6)"""

import re
from typing import List

from ..base import Detector, RegexDetector
from ..entities import EntityType, PIIMatch
from ..registry import register_universal

_IPV4 = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b"
)

_IPV6 = re.compile(
    r"\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b"
    r"|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b"
    r"|\b::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}\b"
)


@register_universal
class IpAddressDetector(Detector):
    entity_type = EntityType.IP_ADDRESS
    score = 0.95

    def iter_matches(self, text: str) -> List[PIIMatch]:
        results: List[PIIMatch] = []
        for pattern in (_IPV4, _IPV6):
            for match in pattern.finditer(text):
                matched_text = match.group()
                # Skip common non-IP patterns like version numbers
                if pattern is _IPV4 and self._is_version_number(text, match.start()):
                    continue
                results.append(PIIMatch(
                    entity_type=self.entity_type.value,
                    text=matched_text,
                    start=match.start(),
                    end=match.end(),
                    score=self.score,
                ))
        return results

    @staticmethod
    def _is_version_number(text: str, start: int) -> bool:
        """Skip patterns preceded by 'v' or 'version' that look like version numbers."""
        if start > 0 and text[start - 1].lower() == "v":
            return True
        prefix = text[max(0, start - 10):start].lower().strip()
        return prefix.endswith("version")
