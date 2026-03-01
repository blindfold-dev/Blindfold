"""Belgian Enterprise Number (BCE/KBO) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import be_enterprise_checksum


@register_region("be")
class EnterpriseNumberDetector(RegexDetector):
    entity_type = EntityType.BE_ENTERPRISE_NUMBER
    score = 0.85
    context_keywords = [
        "bce", "kbo", "enterprise number", "ondernemingsnummer",
        "numero entreprise",
    ]
    context_required = True
    context_window = 50

    pattern = re.compile(
        r"\b[01]\d{3}[. ]?\d{3}[. ]?\d{3}\b"
    )
    validator = staticmethod(be_enterprise_checksum)
