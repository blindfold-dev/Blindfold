"""Chilean RUT (Rol Unico Tributario) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import cl_rut_checksum


@register_region("cl")
class ClRutDetector(RegexDetector):
    entity_type = EntityType.CL_RUT
    score = 0.85
    context_keywords = [
        "rut", "run", "rol unico tributario", "rol unico nacional",
    ]
    context_required = True
    context_window = 50

    # XX.XXX.XXX-X format (check digit can be 0-9 or K)
    pattern = re.compile(
        r"\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]\b"
    )
    validator = staticmethod(cl_rut_checksum)
