"""Brazilian CNPJ (Cadastro Nacional de Pessoa Juridica) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import br_cnpj_checksum


@register_region("br")
class CnpjDetector(RegexDetector):
    entity_type = EntityType.BR_CNPJ
    score = 0.90
    context_keywords = [
        "cnpj", "cadastro nacional",
    ]
    context_required = False
    context_window = 50

    # XX.XXX.XXX/XXXX-XX
    pattern = re.compile(
        r"\b\d{2}\.?\d{3}\.?\d{3}/?\d{4}[-.]?\d{2}\b"
    )
    validator = staticmethod(br_cnpj_checksum)
