"""Brazilian CPF (Cadastro de Pessoa Fisica) detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import br_cpf_checksum


@register_region("br")
class CpfDetector(RegexDetector):
    entity_type = EntityType.BR_CPF
    score = 0.90
    context_keywords = [
        "cpf", "cadastro de pessoa",
    ]
    context_required = False
    context_window = 50

    # XXX.XXX.XXX-XX or plain 11 digits
    pattern = re.compile(
        r"\b\d{3}\.?\d{3}\.?\d{3}[-.]?\d{2}\b"
    )
    validator = staticmethod(br_cpf_checksum)
