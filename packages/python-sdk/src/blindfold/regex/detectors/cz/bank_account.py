"""Czech Bank Account Number detector"""

import re

from ...base import RegexDetector
from ...entities import EntityType
from ...registry import register_region
from ...validators import cz_bank_account_valid


@register_region("cz")
class BankAccountDetector(RegexDetector):
    entity_type = EntityType.CZ_BANK_ACCOUNT
    score = 0.85
    context_keywords = [
        "ucet", "\u00fa\u010det", "cislo uctu",
        "\u010d\u00edslo \u00fa\u010dtu", "bank account", "bankovni", "bankovn\u00ed",
    ]
    context_required = False
    context_window = 50

    pattern = re.compile(r"\b(?:\d{1,6}-)?\d{2,10}/\d{4}\b")
    validator = staticmethod(cz_bank_account_valid)
