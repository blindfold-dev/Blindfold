"""EU VAT ID detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region


@register_region("eu")
class VatIdDetector(RegexDetector):
    entity_type = EntityType.VAT_ID
    score = 0.90
    # EU VAT numbers: 2-letter country prefix + country-specific format
    pattern = re.compile(
        r"\b(?:"
        r"ATU\d{8}"                        # Austria
        r"|BE[01]\d{9}"                    # Belgium
        r"|DE\d{9}"                        # Germany
        r"|DK\d{8}"                        # Denmark
        r"|ES[A-Z0-9]\d{7}[A-Z0-9]"       # Spain
        r"|FI\d{8}"                        # Finland
        r"|FR[A-Z0-9]{2}\d{9}"            # France
        r"|IT\d{11}"                       # Italy
        r"|LU\d{8}"                        # Luxembourg
        r"|NL\d{9}B\d{2}"                 # Netherlands
        r"|PL\d{10}"                       # Poland
        r"|PT\d{9}"                        # Portugal
        r"|SE\d{12}"                       # Sweden
        r")\b"
    )
